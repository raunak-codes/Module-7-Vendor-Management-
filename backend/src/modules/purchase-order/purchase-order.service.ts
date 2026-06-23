import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { CreatePoDto } from './dto/create-po.dto';

@Injectable()
export class PurchaseOrderService {
  constructor(private prisma: PrismaService, private notifService: NotificationService) {}

  async getAll(user: any, query: any) {
    const { page = 1, limit = 10, status, vendorId: qVendorId, sortBy = 'createdAt', order = 'desc' } = query;
    const where: any = {};
    if (user.role === 'VENDOR') where.vendorId = user.vendorId;
    else if (qVendorId) where.vendorId = qVendorId;
    if (status) where.status = status;

    const [pos, total] = await Promise.all([
      this.prisma.purchaseOrder.findMany({ where, include: { vendor: { select: { businessName: true } }, lines: true }, orderBy: { [sortBy]: order }, skip: (page - 1) * limit, take: +limit }),
      this.prisma.purchaseOrder.count({ where }),
    ]);
    return { pos, pagination: { total, page: +page, limit: +limit, totalPages: Math.ceil(total / limit) } };
  }

  async getById(id: string, user: any) {
    const po = await this.prisma.purchaseOrder.findUnique({ where: { id }, include: { vendor: true, lines: true, workOrders: true, invoices: true } });
    if (!po) throw new NotFoundException('Purchase order not found');
    if (user.role === 'VENDOR' && po.vendorId !== user.vendorId) throw new ForbiddenException();
    return po;
  }

  async create(dto: CreatePoDto) {
    const vendor = await this.prisma.vendor.findUnique({ where: { id: dto.vendorId }, include: { user: { select: { id: true, email: true } } } });
    if (!vendor) throw new NotFoundException('Vendor not found');

    const count = await this.prisma.purchaseOrder.count();
    const poNumber = `PO-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const po = await this.prisma.purchaseOrder.create({
      data: {
        poNumber, vendorId: dto.vendorId, eventId: dto.eventId ?? null, totalAmount: dto.totalAmount,
        currency: dto.currency ?? 'INR', status: 'ISSUED',
        issueDate: dto.issueDate ? new Date(dto.issueDate) : new Date(),
        expectedDeliveryDate: dto.expectedDeliveryDate ? new Date(dto.expectedDeliveryDate) : null,
        lines: { create: dto.lines.map((l) => ({ description: l.description, quantity: l.quantity, unitPrice: l.unitPrice, totalPrice: l.quantity * l.unitPrice })) },
      },
      include: { lines: true },
    });

    await this.notifService.enqueue('PO_ISSUED', {
      userId: vendor.user?.id, email: vendor.user?.email, businessName: vendor.businessName,
      poNumber, amount: dto.totalAmount, notifType: 'INFO',
      title: `New Purchase Order ${poNumber} issued`, message: `A new PO worth ₹${dto.totalAmount} has been issued to you.`,
    });

    return po;
  }

  async updateStatus(id: string, status: string, user: any, reason?: string) {
    const allowed = ['ACCEPTED', 'REJECTED', 'CANCELLED', 'PARTIAL_FULFILLED', 'FULFILLED'];
    if (!allowed.includes(status)) throw new BadRequestException(`Status must be one of: ${allowed.join(', ')}`);

    const po = await this.prisma.purchaseOrder.findUnique({ where: { id }, include: { vendor: { include: { user: { select: { id: true, email: true } } } } } });
    if (!po) throw new NotFoundException('Purchase order not found');

    if (user.role === 'VENDOR') {
      if (po.vendorId !== user.vendorId) throw new ForbiddenException();
      if (!['ACCEPTED', 'REJECTED'].includes(status)) throw new ForbiddenException('Vendors can only accept or reject a PO');
    }

    const updated = await this.prisma.purchaseOrder.update({ where: { id }, data: { status: status as any } });

    const jobType = status === 'ACCEPTED' ? 'PO_ACCEPTED' : status === 'REJECTED' ? 'PO_REJECTED' : null;
    if (jobType) {
      await this.notifService.enqueue(jobType, {
        userId: po.vendor?.user?.id, email: po.vendor?.user?.email, businessName: po.vendor?.businessName,
        poNumber: po.poNumber, reason: reason ?? null, notifType: status === 'REJECTED' ? 'WARNING' : 'INFO',
        title: `PO ${po.poNumber} ${status.toLowerCase()}`, message: `PO ${po.poNumber} has been ${status.toLowerCase()}.`,
      });
      // Notify admins when a vendor responds to a PO
      await this.notifService.notifyAdmins({
        type: status === 'REJECTED' ? 'WARNING' : 'INFO',
        title: `PO ${status === 'ACCEPTED' ? 'Accepted' : 'Rejected'} by Vendor`,
        message: `${po.vendor?.businessName} has ${status.toLowerCase()} purchase order ${po.poNumber}.`,
      });
    }
    return updated;
  }
}
