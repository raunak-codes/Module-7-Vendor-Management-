import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { ContractService } from '../contract/contract.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private prisma: PrismaService,
    private notifService: NotificationService,
    private contractService: ContractService,
  ) {}

  /** Daily at 06:00: expire overdue KYC docs + warn vendors about upcoming expiry */
  @Cron('0 6 * * *', { name: 'kyc-expiry' })
  async runKycExpiryCheck() {
    this.logger.log('[CRON] Running KYC document expiry check...');

    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Mark expired docs
    const expired = await this.prisma.vendorKycDocument.updateMany({
      where: { expiryDate: { lt: now }, status: { not: 'EXPIRED' } },
      data: { status: 'EXPIRED' },
    });
    if (expired.count > 0) this.logger.warn(`Marked ${expired.count} KYC doc(s) as EXPIRED`);

    // Docs expiring within 30 days — find distinct vendors
    const expiringSoon = await this.prisma.vendorKycDocument.findMany({
      where: {
        expiryDate: { gte: now, lte: in30Days },
        status: 'VERIFIED',
      },
      include: { vendor: { include: { user: true } } },
      distinct: ['vendorId'],
    });

    for (const doc of expiringSoon) {
      const daysLeft = Math.ceil((doc.expiryDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const isUrgent = doc.expiryDate! <= in7Days;
      const userId = doc.vendor?.user?.id;
      if (!userId) continue;

      await this.notifService.enqueue('KYC_EXPIRY_WARNING', {
        userId,
        notifType: isUrgent ? 'ALERT' : 'WARNING',
        title: isUrgent
          ? `URGENT: KYC Document Expiring in ${daysLeft} Days`
          : `KYC Document Expiring in ${daysLeft} Days`,
        message: `Your ${doc.type.replace(/_/g, ' ')} document is expiring on ${doc.expiryDate!.toLocaleDateString('en-IN')}. Please upload a renewed document to avoid service disruption.`,
      });
    }

    this.logger.log(`KYC expiry check done — ${expiringSoon.length} vendor(s) warned`);
  }

  /** Daily at 06:30: expire overdue contracts */
  @Cron('30 6 * * *', { name: 'contract-expiry' })
  async runContractExpiryCheck() {
    this.logger.log('[CRON] Running contract expiry check...');

    const count = await this.contractService.expireOverdue();
    if (count > 0) this.logger.warn(`Expired ${count} contract(s)`);

    // Warn vendors about contracts expiring soon
    const expiring = await this.contractService.getExpiringContracts(30);
    for (const contract of expiring) {
      const daysLeft = Math.ceil((new Date(contract.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      const userId = (contract.vendor as any)?.user?.id;
      if (!userId) continue;

      await this.notifService.enqueue('CONTRACT_EXPIRY_WARNING', {
        userId,
        notifType: daysLeft <= 7 ? 'ALERT' : 'WARNING',
        title: `Contract Expiring in ${daysLeft} Days`,
        message: `Your contract "${contract.title}" expires on ${new Date(contract.endDate).toLocaleDateString('en-IN')}. Contact your EventHub360 account manager for renewal.`,
      });
    }

    this.logger.log(`Contract expiry check done — ${expiring.length} vendor(s) warned`);
  }

  /** Every 4 hours: check POs stuck in PENDING_APPROVAL for > 48 hours, escalate once */
  @Cron('0 */4 * * *', { name: 'po-escalation' })
  async runPoEscalation() {
    this.logger.log('[CRON] Running PO approval escalation check...');

    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const stalePOs = await this.prisma.purchaseOrder.findMany({
      where: {
        approvalStatus: 'PENDING',
        createdAt: { lt: cutoff },
        escalatedAt: null,
      },
      include: { vendor: { select: { businessName: true } } },
    });

    if (stalePOs.length === 0) {
      this.logger.log('No POs require escalation');
      return;
    }

    // Stamp escalatedAt so we don't re-fire
    await this.prisma.purchaseOrder.updateMany({
      where: { id: { in: stalePOs.map(p => p.id) } },
      data: { escalatedAt: new Date() },
    });

    // Single bulk notification to all admins
    await this.notifService.notifyAdmins({
      type: 'ALERT',
      title: `${stalePOs.length} PO(s) Awaiting Approval for 48+ Hours`,
      message: stalePOs
        .map(p => `• ${p.poNumber} — ${p.vendor?.businessName} (₹${Number(p.totalAmount).toLocaleString('en-IN')}, Tier ${p.approvalTier?.replace('TIER_', '')})`)
        .join('\n'),
    });

    this.logger.warn(`Escalated ${stalePOs.length} PO(s) to admins`);
  }

  /** Daily at 07:00: auto-flag vendors with avg rating < 2.5 across 3+ distinct events */
  @Cron('0 7 * * *', { name: 'vendor-rating-flag' })
  async runVendorRatingFlag() {
    this.logger.log('[CRON] Running vendor rating auto-flag check...');

    // Aggregate ratings per vendor
    const ratings = await this.prisma.vendorRating.groupBy({
      by: ['vendorId'],
      _avg: { rating: true },
      _count: { eventId: true },
    });

    let flagged = 0;
    let unflagged = 0;

    for (const r of ratings) {
      const avgRating = r._avg.rating ?? 0;
      const eventCount = r._count.eventId ?? 0;
      const shouldFlag = avgRating < 2.5 && eventCount >= 3;

      const vendor = await this.prisma.vendor.findUnique({
        where: { id: r.vendorId },
        include: { user: true },
      });
      if (!vendor) continue;

      if (shouldFlag && !vendor.isFlagged) {
        await this.prisma.vendor.update({
          where: { id: r.vendorId },
          data: {
            isFlagged: true,
            flagReason: `Auto-flagged: avg rating ${avgRating.toFixed(2)} across ${eventCount} events (threshold: 2.5)`,
          },
        });

        // Notify admin
        await this.notifService.notifyAdmins({
          type: 'WARNING',
          title: `Vendor Auto-Flagged: ${vendor.businessName}`,
          message: `${vendor.businessName} has been automatically flagged for low performance. Average rating: ${avgRating.toFixed(2)} across ${eventCount} events. Review and consider action.`,
        });

        // Notify vendor
        if (vendor.user?.id) {
          await this.notifService.enqueue('VENDOR_FLAGGED', {
            userId: vendor.user.id,
            notifType: 'WARNING',
            title: 'Performance Review Notice',
            message: `Your account has been flagged for review due to a low average rating of ${avgRating.toFixed(2)}. Our team will be in touch to discuss performance improvement.`,
          });
        }

        flagged++;
      } else if (!shouldFlag && vendor.isFlagged) {
        // Auto-unflag if rating has improved
        await this.prisma.vendor.update({
          where: { id: r.vendorId },
          data: { isFlagged: false, flagReason: null },
        });
        unflagged++;
      }
    }

    this.logger.log(`Rating flag check done — ${flagged} flagged, ${unflagged} unflagged`);
  }
}
