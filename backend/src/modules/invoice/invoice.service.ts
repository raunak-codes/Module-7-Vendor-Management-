import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class InvoiceService {
  constructor(private prisma: PrismaService, private notifService: NotificationService, private audit: AuditService) {}

  async getAll(user: any, query: any) {
    const { page = 1, limit = 10, status, sortBy = 'createdAt', order = 'desc' } = query;
    const where: any = {};
    if (user.role === 'VENDOR') where.vendorId = user.vendorId;
    if (status) where.status = status;

    const [invoices, total] = await Promise.all([
      this.prisma.vendorInvoice.findMany({ where, include: { vendor: { select: { businessName: true } }, lines: true, purchaseOrder: { select: { poNumber: true } } }, orderBy: { [sortBy]: order }, skip: (page - 1) * limit, take: +limit }),
      this.prisma.vendorInvoice.count({ where }),
    ]);
    return { invoices, pagination: { total, page: +page, limit: +limit, totalPages: Math.ceil(total / limit) } };
  }

  async getById(id: string, user: any) {
    const inv = await this.prisma.vendorInvoice.findUnique({ where: { id }, include: { vendor: true, lines: true, purchaseOrder: true } });
    if (!inv) throw new NotFoundException('Invoice not found');
    if (user.role === 'VENDOR' && inv.vendorId !== user.vendorId) throw new ForbiddenException();
    return inv;
  }

  async create(user: any, body: any) {
    const vendorId = user.role === 'VENDOR' ? user.vendorId : body.vendorId;
    if (!vendorId) throw new BadRequestException('Vendor ID required');

    const vendor = await this.prisma.vendor.findUnique({ where: { id: vendorId }, select: { businessName: true, user: { select: { id: true, email: true } } } });
    if (!vendor) throw new NotFoundException('Vendor not found');

    const count = await this.prisma.vendorInvoice.count();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const inv = await this.prisma.vendorInvoice.create({
      data: {
        invoiceNumber, vendorId, purchaseOrderId: body.purchaseOrderId ?? null,
        totalAmount: body.totalAmount, currency: body.currency ?? 'INR', status: 'SUBMITTED',
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        lines: { create: (body.lines ?? []).map((l: any) => ({ description: l.description, quantity: +l.quantity, unitPrice: +l.unitPrice, totalPrice: +l.quantity * +l.unitPrice })) },
      },
      include: { lines: true },
    });

    await this.notifService.notifyAdmins({
      type: 'INFO',
      title: `New Invoice Submitted`,
      message: `${vendor.businessName} submitted invoice ${invoiceNumber} for ${body.currency ?? 'INR'} ${body.totalAmount}.`,
    });

    return inv;
  }

  async updateStatus(id: string, status: string) {
    const allowed = ['APPROVED', 'REJECTED', 'PAID', 'PARTIAL_PAID'];
    if (!allowed.includes(status)) throw new BadRequestException(`Status must be one of: ${allowed.join(', ')}`);

    const inv = await this.prisma.vendorInvoice.findUnique({ where: { id }, include: { vendor: { include: { user: { select: { id: true, email: true } } } } } });
    if (!inv) throw new NotFoundException('Invoice not found');

    const updated = await this.prisma.vendorInvoice.update({ where: { id }, data: { status: status as any, paymentDate: status === 'PAID' ? new Date() : undefined } });

    if (status === 'PAID') {
      await this.notifService.enqueue('INVOICE_PAID', {
        userId: inv.vendor?.user?.id, email: inv.vendor?.user?.email, businessName: inv.vendor?.businessName,
        invoiceNumber: inv.invoiceNumber, amount: inv.totalAmount,
        notifType: 'INFO', title: `Invoice ${inv.invoiceNumber} has been paid`, message: `Your invoice for ₹${inv.totalAmount} has been paid.`,
      });
    }
    await this.audit.log({ action: `INVOICE_${status}`, entity: 'Invoice', entityId: id, changes: { status, invoiceNumber: inv.invoiceNumber } });
    return updated;
  }

  async recordPayment(id: string, body: { amountPaid: number; txnRef?: string; paymentMethod?: string; notes?: string }) {
    const inv = await this.prisma.vendorInvoice.findUnique({
      where: { id },
      include: { payments: true, vendor: { include: { user: { select: { id: true, email: true } } } } },
    });
    if (!inv) throw new NotFoundException('Invoice not found');
    if (!['APPROVED', 'PARTIAL_PAID'].includes(inv.status)) {
      throw new BadRequestException('Invoice must be APPROVED before recording a payment');
    }

    const payment = await this.prisma.vendorPayment.create({
      data: {
        invoiceId: id,
        vendorId: inv.vendorId,
        amountPaid: body.amountPaid,
        txnRef: body.txnRef ?? null,
        paymentMethod: body.paymentMethod ?? null,
        notes: body.notes ?? null,
        currency: inv.currency,
      },
    });

    const totalPaid = inv.payments.reduce((sum, p) => sum + Number(p.amountPaid), 0) + body.amountPaid;
    const invoiceTotal = Number(inv.totalAmount);
    const newStatus = totalPaid >= invoiceTotal ? 'PAID' : 'PARTIAL_PAID';

    await this.prisma.vendorInvoice.update({
      where: { id },
      data: { status: newStatus as any, paymentDate: newStatus === 'PAID' ? new Date() : undefined },
    });

    if (newStatus === 'PAID') {
      await this.notifService.enqueue('INVOICE_PAID', {
        userId: inv.vendor?.user?.id, email: inv.vendor?.user?.email, businessName: inv.vendor?.businessName,
        invoiceNumber: inv.invoiceNumber, amount: inv.totalAmount,
        notifType: 'INFO', title: `Invoice ${inv.invoiceNumber} has been paid`, message: `Your invoice for ₹${inv.totalAmount} has been fully paid.`,
      });
    }

    await this.audit.log({ action: 'PAYMENT_RECORDED', entity: 'Invoice', entityId: id, changes: { amountPaid: body.amountPaid, txnRef: body.txnRef, newStatus } });
    return payment;
  }

  async getPayments(user: any, query: any) {
    const { page = 1, limit = 20 } = query;
    const where: any = {};
    if (user.role === 'VENDOR') where.vendorId = user.vendorId;

    const [payments, total] = await Promise.all([
      this.prisma.vendorPayment.findMany({
        where,
        include: { invoice: { select: { invoiceNumber: true, totalAmount: true, currency: true, purchaseOrder: { select: { poNumber: true } } } } },
        orderBy: { paidAt: 'desc' },
        skip: (page - 1) * limit,
        take: +limit,
      }),
      this.prisma.vendorPayment.count({ where }),
    ]);
    return { payments, pagination: { total, page: +page, limit: +limit, totalPages: Math.ceil(total / limit) } };
  }
}
