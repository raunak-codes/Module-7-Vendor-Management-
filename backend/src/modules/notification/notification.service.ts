import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectQueue('notifications') private queue: Queue,
    private prisma: PrismaService,
    private gateway: NotificationGateway,
  ) {}

  async enqueue(type: string, data: Record<string, any>) {
    try {
      await this.queue.add(type, { type, data });
    } catch (err) {
      this.logger.warn(`Failed to enqueue notification "${type}": ${err.message}`);
    }
  }

  /** Create a notification directly in the DB for every ADMIN user. */
  async notifyAdmins(params: { type?: NotificationType; title: string; message: string }) {
    try {
      const admins = await this.prisma.user.findMany({ where: { role: 'ADMIN', isDeleted: false }, select: { id: true } });
      await Promise.all(
        admins.map(async (admin) => {
          const notif = await this.prisma.notification.create({
            data: { userId: admin.id, type: params.type ?? 'INFO', title: params.title, message: params.message },
          });
          this.gateway.sendToUser(admin.id, 'notification:new', {
            id: notif.id, type: notif.type, title: notif.title, message: notif.message, isRead: false, createdAt: notif.createdAt,
          });
        }),
      );
    } catch (err) {
      this.logger.warn(`Failed to notify admins: ${err.message}`);
    }
  }

  async getUserNotifications(userId: string, page = 1, limit = 20, unreadOnly = false) {
    const where: any = { userId };
    if (unreadOnly) where.isRead = false;

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return { notifications, unreadCount, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({ where: { id, userId }, data: { isRead: true } });
  }

  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
  }
}
