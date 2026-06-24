import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { AuditService } from '../audit/audit.service';
import { CreatePoDto } from './dto/create-po.dto';

// SDD §9 Approval Matrix thresholds (INR)
const TIER1_MAX = 1000;
const TIER2_MAX = 10000;

function getApprovalTier(amount: number): 'TIER_1' | 'TIER_2' | 'TIER_3' {
  if (amount < TIER1_MAX) return 'TIER_1';
  if (amount <= TIER2_MAX) return 'TIER_2';
  return 'TIER_3';
}

@Injectable()
export class PurchaseOrderService {
  constructor(
    private prisma: PrismaService,
    private notifService: NotificationService,
    private audit: AuditService,
  ) {}

  async getAll(user: any, query: any) {
    const { page = 1, limit = 10, status, approvalStatus, vendorId: qVendorId, sortBy = 'createdAt', order = 'desc' } = query;
    const where: any = {};
    if (user.role === 'VENDOR') where.vendorId = user.vendorId;
    else if (qVendorId) where.vendorId = qVendorId;
    if (status) where.status = status;
    if (approvalStatus) where.approvalStatus = approvalStatus;

    const [pos, total] = await Promise.all([
      this.prisma.purchaseOrder.findMany({
        where,
        include: { vendor: { select: { businessName: true } }, lines: true },
        orderBy: { [sortBy]: order },
        skip: (page - 1) * limit,
        take: +limit,
      }),
      this.prisma.purchaseOrder.count({ where }),
    ]);
    return { pos, pagination: { total, page: +page, limit: +limit, totalPages: Math.ceil(total / limit) } };
  }

  async getPendingApproval() {
    return this.prisma.purchaseOrder.findMany({
      where: { approvalStatus: 'PENDING', isDeleted: false },
      include: { vendor: { select: { businessName: true, category: { select: { name: true } } } }, lines: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getById(id: string, user: any) {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: { vendor: true, lines: true, workOrders: true, invoices: true },
    });
    if (!po) throw new NotFoundException('Purchase order not found');
    if (user.role === 'VENDOR' && po.vendorId !== user.vendorId) throw new ForbiddenException();
    return po;
  }

  async create(dto: CreatePoDto, createdById?: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: dto.vendorId },
      include: { user: { select: { id: true, email: true } } },
    });
    if (!vendor) throw new NotFoundException('Vendor not found');

    const amount = Number(dto.totalAmount);
    const tier = getApprovalTier(amount);
    const autoApprove = tier === 'TIER_1';

    const count = await this.prisma.purchaseOrder.count();
    const poNumber = `PO-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const po = await this.prisma.purchaseOrder.create({
      data: {
        poNumber,
        vendorId: dto.vendorId,
        eventId: dto.eventId ?? null,
        totalAmount: dto.totalAmount,
        currency: dto.currency ?? 'INR',
        status: autoApprove ? 'ISSUED' : 'PENDING_APPROVAL',
        approvalTier: tier,
        approvalStatus: autoApprove ? 'AUTO_APPROVED' : 'PENDING',
        approvedById: autoApprove ? (createdById ?? null) : null,
        approvedAt: autoApprove ? new Date() : null,
        issueDate: autoApprove ? new Date() : null,
        expectedDeliveryDate: dto.expectedDeliveryDate ? new Date(dto.expectedDeliveryDate) : null,
        lines: {
          create: dto.lines.map((l) => ({
            description: l.description,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
            totalPrice: l.quantity * l.unitPrice,
          })),
        },
      },
      include: { lines: true },
    });

    await this.audit.log({
      userId: createdById,
      action: 'PO_CREATED',
      entity: 'PurchaseOrder',
      entityId: po.id,
      changes: { poNumber, amount, tier, autoApprove },
    });

    if (autoApprove) {
      // Notify vendor immediately
      await this.notifService.enqueue('PO_ISSUED', {
        userId: vendor.user?.id, email: vendor.user?.email, businessName: vendor.businessName,
        poNumber, amount: dto.totalAmount, notifType: 'INFO',
        title: `New Purchase Order ${poNumber} issued`,
        message: `A new PO worth ₹${dto.totalAmount} has been auto-approved and issued to you.`,
      });
    } else {
      // Notify admins to approve
      const tierLabel = tier === 'TIER_2' ? 'Procurement Manager' : 'Finance/Owner';
      await this.notifService.notifyAdmins({
        type: 'WARNING',
        title: `PO Pending Approval (${tierLabel})`,
        message: `PO ${poNumber} for ₹${amount.toLocaleString()} requires ${tierLabel} approval before dispatch.`,
      });
    }

    return po;
  }

  async approve(id: string, adminId: string) {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: { vendor: { include: { user: { select: { id: true, email: true } } } } },
    });
    if (!po) throw new NotFoundException('Purchase order not found');
    if (po.approvalStatus !== 'PENDING') {
      throw new BadRequestException(`PO is already ${po.approvalStatus.toLowerCase()}`);
    }

    const updated = await this.prisma.purchaseOrder.update({
      where: { id },
      data: {
        approvalStatus: 'APPROVED',
        approvedById: adminId,
        approvedAt: new Date(),
        status: 'ISSUED',
        issueDate: new Date(),
      },
    });

    await this.notifService.enqueue('PO_ISSUED', {
      userId: po.vendor?.user?.id, email: po.vendor?.user?.email, businessName: po.vendor?.businessName,
      poNumber: po.poNumber, amount: po.totalAmount, notifType: 'INFO',
      title: `Purchase Order ${po.poNumber} Approved & Issued`,
      message: `Your PO ${po.poNumber} for ₹${po.totalAmount} has been approved and issued.`,
    });

    await this.audit.log({
      userId: adminId,
      action: 'PO_APPROVED',
      entity: 'PurchaseOrder',
      entityId: id,
      changes: { poNumber: po.poNumber, approvedById: adminId },
    });

    return updated;
  }

  async rejectApproval(id: string, adminId: string, reason: string) {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: { vendor: { include: { user: { select: { id: true, email: true } } } } },
    });
    if (!po) throw new NotFoundException('Purchase order not found');
    if (po.approvalStatus !== 'PENDING') {
      throw new BadRequestException(`PO is already ${po.approvalStatus.toLowerCase()}`);
    }

    const updated = await this.prisma.purchaseOrder.update({
      where: { id },
      data: {
        approvalStatus: 'REJECTED',
        approvedById: adminId,
        approvedAt: new Date(),
        rejectionReason: reason ?? 'No reason provided',
        status: 'CANCELLED',
      },
    });

    await this.audit.log({
      userId: adminId,
      action: 'PO_APPROVAL_REJECTED',
      entity: 'PurchaseOrder',
      entityId: id,
      changes: { poNumber: po.poNumber, reason },
    });

    return updated;
  }

  async updateStatus(id: string, status: string, user: any, reason?: string) {
    const allowed = ['ACCEPTED', 'REJECTED', 'CANCELLED', 'PARTIAL_FULFILLED', 'FULFILLED'];
    if (!allowed.includes(status)) throw new BadRequestException(`Status must be one of: ${allowed.join(', ')}`);

    const po = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: { vendor: { include: { user: { select: { id: true, email: true } } } } },
    });
    if (!po) throw new NotFoundException('Purchase order not found');

    if (po.approvalStatus === 'PENDING' && user.role === 'ADMIN') {
      throw new BadRequestException('This PO is pending approval — approve it first before changing its status');
    }

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
        title: `PO ${po.poNumber} ${status.toLowerCase()}`,
        message: `PO ${po.poNumber} has been ${status.toLowerCase()}.`,
      });
      await this.notifService.notifyAdmins({
        type: status === 'REJECTED' ? 'WARNING' : 'INFO',
        title: `PO ${status === 'ACCEPTED' ? 'Accepted' : 'Rejected'} by Vendor`,
        message: `${po.vendor?.businessName} has ${status.toLowerCase()} purchase order ${po.poNumber}.`,
      });
    }

    await this.audit.log({
      userId: user.id,
      action: `PO_${status}`,
      entity: 'PurchaseOrder',
      entityId: id,
      changes: { status, poNumber: po.poNumber },
    });

    return updated;
  }
}
