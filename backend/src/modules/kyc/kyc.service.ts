import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MinioService } from '../minio/minio.service';
import { NotificationService } from '../notification/notification.service';
import { KycDocumentType } from '@prisma/client';

@Injectable()
export class KycService {
  constructor(
    private prisma: PrismaService,
    private minio: MinioService,
    private notifService: NotificationService,
  ) {}

  async upload(vendorId: string, file: Express.Multer.File, type: KycDocumentType, expiryDate?: string, requestingUser?: any) {
    const vendor = await this.prisma.vendor.findUnique({ where: { id: vendorId } });
    if (!vendor) throw new NotFoundException('Vendor not found');
    if (requestingUser?.role === 'VENDOR' && requestingUser.vendorId !== vendorId) throw new ForbiddenException();

    const objectName = await this.minio.upload(file, `kyc/${vendorId}`);
    return this.prisma.vendorKycDocument.create({
      data: { vendorId, type, documentUrl: objectName, status: 'PENDING', expiryDate: expiryDate ? new Date(expiryDate) : null },
    });
  }

  async getAll(vendorId: string, requestingUser?: any) {
    if (requestingUser?.role === 'VENDOR' && requestingUser.vendorId !== vendorId) throw new ForbiddenException();
    const docs = await this.prisma.vendorKycDocument.findMany({ where: { vendorId }, orderBy: { createdAt: 'desc' } });
    return Promise.all(docs.map(async (d) => ({ ...d, downloadUrl: await this.minio.getPresignedUrl(d.documentUrl) })));
  }

  async getOne(vendorId: string, docId: string) {
    const doc = await this.prisma.vendorKycDocument.findFirst({ where: { id: docId, vendorId } });
    if (!doc) throw new NotFoundException('Document not found');
    return { ...doc, downloadUrl: await this.minio.getPresignedUrl(doc.documentUrl) };
  }

  async updateStatus(vendorId: string, docId: string, status: string) {
    const allowed = ['VERIFIED', 'REJECTED', 'EXPIRED'];
    if (!allowed.includes(status)) throw new BadRequestException(`Status must be one of: ${allowed.join(', ')}`);

    const doc = await this.prisma.vendorKycDocument.update({
      where: { id: docId },
      data: { status: status as any },
      include: { vendor: { include: { user: { select: { id: true, email: true } } } } },
    });

    const jobType = status === 'VERIFIED' ? 'KYC_VERIFIED' : status === 'REJECTED' ? 'KYC_REJECTED' : null;
    if (jobType) {
      await this.notifService.enqueue(jobType, {
        userId: doc.vendor?.user?.id, email: doc.vendor?.user?.email, businessName: doc.vendor?.businessName,
        docType: doc.type, notifType: status === 'REJECTED' ? 'WARNING' : 'INFO',
        title: `KYC document ${status.toLowerCase()}`, message: `Your ${doc.type} document has been ${status.toLowerCase()}.`,
      });
    }
    return doc;
  }

  async remove(vendorId: string, docId: string) {
    const doc = await this.prisma.vendorKycDocument.findFirst({ where: { id: docId, vendorId } });
    if (!doc) throw new NotFoundException('Document not found');
    await this.minio.delete(doc.documentUrl);
    await this.prisma.vendorKycDocument.delete({ where: { id: docId } });
  }
}
