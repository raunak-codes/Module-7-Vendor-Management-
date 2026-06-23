import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationGateway } from './notification.gateway';
import { MailerService } from './mailer.service';

@Processor('notifications')
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private prisma: PrismaService,
    private gateway: NotificationGateway,
    private mailer: MailerService,
  ) {
    super();
  }

  async process(job: Job<{ type: string; data: Record<string, any> }>) {
    const { type, data } = job.data;
    this.logger.log(`Processing job "${type}" (id: ${job.id})`);

    // 1. Save in-app notification
    if (data.userId) {
      const notif = await this.prisma.notification.create({
        data: { userId: data.userId, type: data.notifType ?? 'INFO', title: data.title ?? type, message: data.message ?? '' },
      });

      // 2. Push real-time via Socket.IO
      this.gateway.sendToUser(data.userId, 'notification:new', {
        id: notif.id, type: notif.type, title: notif.title, message: notif.message, isRead: false, createdAt: notif.createdAt,
      });

      this.logger.log(`Real-time notification emitted to user ${data.userId}`);
    }

    // 3. Send email
    if (data.email) {
      await this.mailer.send(type, data);
      this.logger.log(`Email sent for "${type}" to ${data.email}`);
    }
  }
}
