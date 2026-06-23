import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class WorkOrderService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private notifService: NotificationService,
  ) {}

  async getAll(user: any, query: any) {
    const { page = 1, limit = 10, status } = query;
    const where: any = {};
    if (user.role === 'VENDOR') where.vendorId = user.vendorId;
    if (status) where.status = status;

    const [wos, total] = await Promise.all([
      this.prisma.workOrder.findMany({ where, include: { vendor: { select: { businessName: true } }, purchaseOrder: { select: { poNumber: true } } }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: +limit }),
      this.prisma.workOrder.count({ where }),
    ]);
    return { wos, pagination: { total, page: +page, limit: +limit, totalPages: Math.ceil(total / limit) } };
  }

  async getById(id: string, user: any) {
    const wo = await this.prisma.workOrder.findUnique({ where: { id }, include: { vendor: true, purchaseOrder: true } });
    if (!wo) throw new NotFoundException('Work order not found');
    if (user.role === 'VENDOR' && wo.vendorId !== user.vendorId) throw new ForbiddenException();
    return wo;
  }

  async create(body: any) {
    const vendor = await this.prisma.vendor.findUnique({ where: { id: body.vendorId }, select: { businessName: true, user: { select: { id: true } } } });
    const count = await this.prisma.workOrder.count();
    const woNumber = `WO-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    const wo = await this.prisma.workOrder.create({
      data: {
        woNumber, vendorId: body.vendorId, purchaseOrderId: body.purchaseOrderId ?? null,
        eventId: body.eventId ?? null, description: body.description, status: 'ASSIGNED',
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
      },
    });
    await this.audit.log({ action: 'WORK_ORDER_CREATED', entity: 'WorkOrder', entityId: wo.id, changes: { woNumber, vendorId: body.vendorId, description: body.description } });
    // Notify the assigned vendor
    if (vendor?.user?.id) {
      await this.notifService.enqueue('WORK_ORDER_ASSIGNED', {
        userId: vendor.user.id, businessName: vendor.businessName,
        notifType: 'INFO', title: `New Work Order Assigned: ${woNumber}`,
        message: `You have been assigned work order ${woNumber}: ${body.description}`,
      });
    }
    return wo;
  }

  async updateStatus(id: string, status: string, user: any) {
    const allowed = ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED'];
    if (!allowed.includes(status)) throw new BadRequestException(`Status must be one of: ${allowed.join(', ')}`);

    const wo = await this.prisma.workOrder.findUnique({ where: { id } });
    if (!wo) throw new NotFoundException('Work order not found');
    if (user.role === 'VENDOR' && wo.vendorId !== user.vendorId) throw new ForbiddenException();

    const updated = await this.prisma.workOrder.update({ where: { id }, data: { status: status as any } });
    await this.audit.log({ userId: user.id, action: `WO_STATUS_${status}`, entity: 'WorkOrder', entityId: id, changes: { from: wo.status, to: status } });
    // Notify admins when vendor updates work order status
    if (user.role === 'VENDOR') {
      await this.notifService.notifyAdmins({
        type: status === 'COMPLETED' ? 'INFO' : 'WARNING',
        title: `Work Order ${status === 'COMPLETED' ? 'Completed' : 'Updated'}`,
        message: `Work order ${wo.woNumber} has been marked as ${status} by the assigned vendor.`,
      });
    }
    return updated;
  }
}
