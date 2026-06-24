import { Injectable, Logger } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationGateway } from './notification.gateway';
import { MailerService } from './mailer.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private prisma: PrismaService,
    private gateway: NotificationGateway,
    private mailer: MailerService,
  ) {}

  /** Send an in-app notification to a specific user (and optionally an email). */
  async enqueue(type: string, data: Record<string, any>) {
    try {
      if (data.userId) {
        const notif = await this.prisma.notification.create({
          data: {
            userId: data.userId,
            type: data.notifType ?? 'INFO',
            title: data.title ?? type,
            message: data.message ?? '',
          },
        });
        this.gateway.sendToUser(data.userId, 'notification:new', {
          id: notif.id, type: notif.type, title: notif.title, message: notif.message, isRead: false, createdAt: notif.createdAt,
        });
      }
      if (data.email) {
        this.mailer.send(type, data).catch((err) =>
          this.logger.warn(`Email failed for "${type}": ${err.message}`),
        );
      }
    } catch (err) {
      this.logger.warn(`Failed to send notification "${type}": ${err.message}`);
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
