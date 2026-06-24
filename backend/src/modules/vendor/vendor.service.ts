import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { VendorQueryDto } from './dto/vendor-query.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { NotificationService } from '../notification/notification.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class VendorService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
    private audit: AuditService,
  ) {}

  async getMyProfile(vendorId: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: vendorId },
      include: { category: true, kycDocuments: true, services: true, user: { select: { id: true, email: true } } },
    });
    if (!vendor) throw new NotFoundException('Vendor profile not found');
    return vendor;
  }

  async updateMyProfile(vendorId: string, dto: UpdateVendorDto) {
    return this.prisma.vendor.update({ where: { id: vendorId }, data: dto });
  }

  async getAll(query: VendorQueryDto) {
    const { page = 1, limit = 10, search, status, categoryId, sortBy = 'createdAt', order = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where: any = { isDeleted: false };
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { contactPersonName: { contains: search, mode: 'insensitive' } },
        { gstNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [vendors, total] = await Promise.all([
      this.prisma.vendor.findMany({ where, include: { category: true, user: { select: { email: true, phone: true } } }, orderBy: { [sortBy]: order }, skip, take: limit }),
      this.prisma.vendor.count({ where }),
    ]);

    return { vendors, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getById(vendorId: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: vendorId },
      include: { category: true, kycDocuments: true, services: true, user: { select: { email: true, phone: true } } },
    });
    if (!vendor || vendor.isDeleted) throw new NotFoundException('Vendor not found');
    return vendor;
  }

  async getPending() {
    return this.prisma.vendor.findMany({
      where: { status: 'PENDING', isDeleted: false },
      include: { category: true, kycDocuments: true, user: { select: { email: true, phone: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async approve(vendorId: string) {
    const vendor = await this.prisma.vendor.update({
      where: { id: vendorId },
      data: { status: 'ACTIVE' },
      include: { user: { select: { id: true, email: true } } },
    });
    await this.notificationService.enqueue('VENDOR_APPROVED', {
      userId: vendor.user?.id, email: vendor.user?.email, businessName: vendor.businessName,
      notifType: 'INFO', title: 'Your vendor account has been approved!', message: 'Congratulations! Your account is now active.',
    });
    await this.audit.log({ action: 'VENDOR_APPROVED', entity: 'Vendor', entityId: vendorId, changes: { status: 'ACTIVE', businessName: vendor.businessName } });
    await this.notificationService.notifyAdmins({ type: 'INFO', title: 'Vendor Approved', message: `${vendor.businessName} has been approved and is now active.` });
    return vendor;
  }

  async reject(vendorId: string, reason?: string) {
    const vendor = await this.prisma.vendor.update({
      where: { id: vendorId },
      data: { status: 'REJECTED' },
      include: { user: { select: { id: true, email: true } } },
    });
    await this.notificationService.enqueue('VENDOR_REJECTED', {
      userId: vendor.user?.id, email: vendor.user?.email, businessName: vendor.businessName, reason,
      notifType: 'WARNING', title: 'Vendor application not approved', message: reason ?? 'Your application was not approved.',
    });
    await this.audit.log({ action: 'VENDOR_REJECTED', entity: 'Vendor', entityId: vendorId, changes: { status: 'REJECTED', reason, businessName: vendor.businessName } });
    await this.notificationService.notifyAdmins({ type: 'WARNING', title: 'Vendor Rejected', message: `${vendor.businessName} was rejected. Reason: ${reason ?? 'No reason given.'}` });
    return vendor;
  }

  async blacklist(vendorId: string, reason: string, adminId: string) {
    if (!reason) throw new BadRequestException('Reason is required to blacklist a vendor');
    const [vendor] = await this.prisma.$transaction([
      this.prisma.vendor.update({ where: { id: vendorId }, data: { status: 'BLACKLISTED' } }),
      this.prisma.vendorBlacklist.upsert({
        where: { vendorId },
        update: { reason, blacklistedById: adminId },
        create: { vendorId, reason, blacklistedById: adminId },
      }),
    ]);
    return vendor;
  }

  // ── Services ──────────────────────────────────────────────
  async getServices(vendorId: string) {
    return this.prisma.vendorService.findMany({ where: { vendorId }, orderBy: { createdAt: 'asc' } });
  }

  async createService(vendorId: string, body: { name: string; description?: string; rate?: number; currency?: string }) {
    return this.prisma.vendorService.create({ data: { vendorId, name: body.name, description: body.description ?? null, rate: body.rate ?? null, currency: body.currency ?? 'INR' } });
  }

  async updateService(serviceId: string, vendorId: string, body: { name?: string; description?: string; rate?: number; currency?: string }) {
    const svc = await this.prisma.vendorService.findFirst({ where: { id: serviceId, vendorId } });
    if (!svc) throw new NotFoundException('Service not found');
    return this.prisma.vendorService.update({ where: { id: serviceId }, data: body });
  }

  async deleteService(serviceId: string, vendorId: string) {
    const svc = await this.prisma.vendorService.findFirst({ where: { id: serviceId, vendorId } });
    if (!svc) throw new NotFoundException('Service not found');
    return this.prisma.vendorService.delete({ where: { id: serviceId } });
  }

  // ── Work Orders for vendor ─────────────────────────────────
  async getMyWorkOrders(vendorId: string) {
    return this.prisma.workOrder.findMany({
      where: { vendorId },
      include: { purchaseOrder: { select: { poNumber: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDashboard(vendorId: string) {
    const [activeWorkOrders, pendingInvoices, recentActivity, ratingAgg, upcomingEvents] = await Promise.all([
      this.prisma.workOrder.count({ where: { vendorId, status: { in: ['ASSIGNED', 'IN_PROGRESS'] } } }),
      this.prisma.vendorInvoice.aggregate({ where: { vendorId, status: 'SUBMITTED' }, _sum: { totalAmount: true } }),
      this.prisma.workOrder.findMany({ where: { vendorId }, orderBy: { updatedAt: 'desc' }, take: 5, select: { woNumber: true, description: true, status: true, updatedAt: true } }),
      this.prisma.vendorRating.aggregate({ where: { vendorId }, _avg: { rating: true }, _count: true }),
      this.prisma.eventVendor.findMany({ where: { vendorId }, orderBy: { createdAt: 'desc' }, take: 3, select: { eventId: true, role: true, createdAt: true } }),
    ]);
    return {
      activeWorkOrders,
      pendingPaymentAmount: pendingInvoices._sum.totalAmount ?? 0,
      averageRating: ratingAgg._avg.rating ?? 0,
      totalRatings: ratingAgg._count,
      upcomingEvents,
      recentActivity: recentActivity.map((wo) => ({ title: `Work Order ${wo.woNumber}`, description: wo.description, status: wo.status, date: wo.updatedAt })),
    };
  }

  async getAdminDashboard() {
    const [totalVendors, pendingKyc, activePOs, pendingPayments, vendorsByStatus] = await Promise.all([
      this.prisma.vendor.count({ where: { isDeleted: false } }),
      this.prisma.vendorKycDocument.count({ where: { status: 'PENDING' } }),
      this.prisma.purchaseOrder.count({ where: { status: { in: ['ISSUED', 'ACCEPTED'] } } }),
      this.prisma.vendorInvoice.aggregate({ where: { status: 'APPROVED' }, _sum: { totalAmount: true } }),
      this.prisma.vendor.groupBy({ by: ['status'], _count: true, where: { isDeleted: false } }),
    ]);
    return {
      totalVendors, pendingKycRequests: pendingKyc, activePurchaseOrders: activePOs,
      pendingPaymentAmount: pendingPayments._sum.totalAmount ?? 0,
      vendorsByStatus: vendorsByStatus.map((s) => ({ status: s.status, count: s._count })),
    };
  }
}
