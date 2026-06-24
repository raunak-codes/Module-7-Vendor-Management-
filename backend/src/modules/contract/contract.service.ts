import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class ContractService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private notifService: NotificationService,
  ) {}

  async getAll(query: any) {
    const { page = 1, limit = 20, status, vendorId } = query;
    const where: any = {};
    if (status) where.status = status;
    if (vendorId) where.vendorId = vendorId;

    const [contracts, total] = await Promise.all([
      this.prisma.vendorContract.findMany({
        where,
        include: { vendor: { select: { businessName: true } }, slas: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: +limit,
      }),
      this.prisma.vendorContract.count({ where }),
    ]);
    return { contracts, pagination: { total, page: +page, limit: +limit, totalPages: Math.ceil(total / limit) } };
  }

  async getById(id: string) {
    const contract = await this.prisma.vendorContract.findUnique({
      where: { id },
      include: { vendor: { select: { businessName: true, user: { select: { email: true } } } }, slas: true },
    });
    if (!contract) throw new NotFoundException('Contract not found');
    return contract;
  }

  async getForVendor(vendorId: string) {
    return this.prisma.vendorContract.findMany({
      where: { vendorId },
      include: { slas: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(body: {
    vendorId: string;
    title: string;
    startDate: string;
    endDate: string;
    notes?: string;
    documentUrl?: string;
    slas?: { metric: string; target: string; penaltyPct?: number }[];
  }, createdById: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: body.vendorId },
      include: { user: { select: { id: true, email: true } } },
    });
    if (!vendor) throw new NotFoundException('Vendor not found');

    const start = new Date(body.startDate);
    const end = new Date(body.endDate);
    if (end <= start) throw new BadRequestException('End date must be after start date');

    const contract = await this.prisma.vendorContract.create({
      data: {
        vendorId: body.vendorId,
        title: body.title,
        startDate: start,
        endDate: end,
        notes: body.notes ?? null,
        documentUrl: body.documentUrl ?? null,
        createdById,
        status: 'DRAFT',
        slas: body.slas?.length
          ? { create: body.slas.map(s => ({ metric: s.metric, target: s.target, penaltyPct: s.penaltyPct ?? null })) }
          : undefined,
      },
      include: { slas: true },
    });

    await this.audit.log({
      userId: createdById,
      action: 'CONTRACT_CREATED',
      entity: 'VendorContract',
      entityId: contract.id,
      changes: { title: body.title, startDate: body.startDate, endDate: body.endDate, vendorId: body.vendorId },
    });

    return contract;
  }

  async activate(id: string, adminId: string) {
    const contract = await this.prisma.vendorContract.findUnique({
      where: { id },
      include: { vendor: { include: { user: { select: { id: true, email: true } } } } },
    });
    if (!contract) throw new NotFoundException('Contract not found');
    if (contract.status !== 'DRAFT') throw new BadRequestException('Only DRAFT contracts can be activated');

    const updated = await this.prisma.vendorContract.update({
      where: { id },
      data: { status: 'ACTIVE', signedAt: new Date() },
    });

    await this.notifService.enqueue('CONTRACT_ACTIVATED', {
      userId: contract.vendor?.user?.id,
      email: contract.vendor?.user?.email,
      businessName: contract.vendor?.businessName,
      notifType: 'INFO',
      title: `Contract "${contract.title}" is now Active`,
      message: `Your contract "${contract.title}" has been signed and is now active until ${contract.endDate.toLocaleDateString()}.`,
    });

    await this.audit.log({
      userId: adminId,
      action: 'CONTRACT_ACTIVATED',
      entity: 'VendorContract',
      entityId: id,
      changes: { status: 'ACTIVE', vendorId: contract.vendorId },
    });

    return updated;
  }

  async terminate(id: string, adminId: string, reason?: string) {
    const contract = await this.prisma.vendorContract.findUnique({ where: { id } });
    if (!contract) throw new NotFoundException('Contract not found');
    if (!['DRAFT', 'ACTIVE'].includes(contract.status)) {
      throw new BadRequestException('Only DRAFT or ACTIVE contracts can be terminated');
    }

    const updated = await this.prisma.vendorContract.update({
      where: { id },
      data: { status: 'TERMINATED', notes: reason ? `${contract.notes ?? ''}\n[TERMINATED] ${reason}`.trim() : contract.notes },
    });

    await this.audit.log({
      userId: adminId,
      action: 'CONTRACT_TERMINATED',
      entity: 'VendorContract',
      entityId: id,
      changes: { reason, vendorId: contract.vendorId },
    });

    return updated;
  }

  async update(id: string, body: { title?: string; notes?: string; documentUrl?: string; endDate?: string }, adminId: string) {
    const contract = await this.prisma.vendorContract.findUnique({ where: { id } });
    if (!contract) throw new NotFoundException('Contract not found');
    if (contract.status === 'TERMINATED') throw new BadRequestException('Cannot update a terminated contract');

    const updated = await this.prisma.vendorContract.update({
      where: { id },
      data: {
        title: body.title ?? undefined,
        notes: body.notes ?? undefined,
        documentUrl: body.documentUrl ?? undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
      },
      include: { slas: true },
    });

    await this.audit.log({ userId: adminId, action: 'CONTRACT_UPDATED', entity: 'VendorContract', entityId: id, changes: body });
    return updated;
  }

  async addSla(contractId: string, body: { metric: string; target: string; penaltyPct?: number }) {
    const contract = await this.prisma.vendorContract.findUnique({ where: { id: contractId } });
    if (!contract) throw new NotFoundException('Contract not found');
    return this.prisma.contractSLA.create({
      data: { contractId, metric: body.metric, target: body.target, penaltyPct: body.penaltyPct ?? null },
    });
  }

  async deleteSla(slaId: string) {
    const sla = await this.prisma.contractSLA.findUnique({ where: { id: slaId } });
    if (!sla) throw new NotFoundException('SLA not found');
    return this.prisma.contractSLA.delete({ where: { id: slaId } });
  }

  /** Called by CRON to expire contracts past their endDate */
  async expireOverdue() {
    const now = new Date();
    const result = await this.prisma.vendorContract.updateMany({
      where: { status: 'ACTIVE', endDate: { lt: now } },
      data: { status: 'EXPIRED' },
    });
    return result.count;
  }

  /** Returns contracts expiring within the next `days` days */
  async getExpiringContracts(days = 30) {
    const now = new Date();
    const cutoff = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    return this.prisma.vendorContract.findMany({
      where: { status: 'ACTIVE', endDate: { gte: now, lte: cutoff } },
      include: { vendor: { select: { businessName: true, user: { select: { id: true, email: true } } } }, slas: true },
      orderBy: { endDate: 'asc' },
    });
  }
}
