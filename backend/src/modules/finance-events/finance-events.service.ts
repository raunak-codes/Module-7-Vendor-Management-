import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { FinanceEventType } from '@prisma/client';

@Injectable()
export class FinanceEventsService {
  private readonly logger = new Logger(FinanceEventsService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async emit(params: {
    type: FinanceEventType;
    entityId: string;
    entityType: string;
    vendorId?: string;
    amount?: number;
    currency?: string;
    metadata?: Record<string, any>;
  }) {
    const event = await this.prisma.financeEvent.create({
      data: {
        type: params.type,
        entityId: params.entityId,
        entityType: params.entityType,
        vendorId: params.vendorId ?? null,
        amount: params.amount ?? null,
        currency: params.currency ?? 'INR',
        metadata: params.metadata ?? undefined,
      },
    });

    // Fire-and-forget webhook if configured
    const webhookUrl = this.config.get<string>('FINANCE_WEBHOOK_URL');
    if (webhookUrl) {
      this.dispatchWebhook(event.id, webhookUrl, event).catch(() => null);
    }

    return event;
  }

  private async dispatchWebhook(eventId: string, url: string, payload: any) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-EventHub-Source': 'vendor-mgmt' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000),
      });
      await this.prisma.financeEvent.update({
        where: { id: eventId },
        data: { webhookSent: res.ok, webhookAt: new Date() },
      });
      this.logger.log(`Webhook dispatched for event ${eventId}: ${res.status}`);
    } catch (err) {
      this.logger.warn(`Webhook failed for event ${eventId}: ${err.message}`);
    }
  }

  async getAll(query: { page?: number; limit?: number; type?: string; vendorId?: string }) {
    const { page = 1, limit = 50, type, vendorId } = query;
    const where: any = {};
    if (type) where.type = type;
    if (vendorId) where.vendorId = vendorId;

    const [events, total] = await Promise.all([
      this.prisma.financeEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: +limit,
      }),
      this.prisma.financeEvent.count({ where }),
    ]);

    return { events, pagination: { total, page: +page, limit: +limit, totalPages: Math.ceil(total / limit) } };
  }

  async getSummary() {
    const [byType, totalAmount, webhookStats] = await Promise.all([
      this.prisma.financeEvent.groupBy({ by: ['type'], _count: true }),
      this.prisma.financeEvent.aggregate({ _sum: { amount: true }, where: { type: { in: ['INVOICE_PAID', 'PAYMENT_RECORDED'] } } }),
      this.prisma.financeEvent.groupBy({ by: ['webhookSent'], _count: true }),
    ]);
    return {
      byType: byType.map(e => ({ type: e.type, count: (e as any)._count })),
      totalPaidAmount: totalAmount._sum.amount ?? 0,
      webhookStats: {
        sent: webhookStats.find(w => w.webhookSent)?._count ?? 0,
        pending: webhookStats.find(w => !w.webhookSent)?._count ?? 0,
      },
    };
  }
}
