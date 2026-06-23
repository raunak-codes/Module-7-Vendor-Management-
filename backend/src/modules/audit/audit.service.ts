import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  async log(params: {
    userId?: string;
    action: string;
    entity: string;
    entityId: string;
    changes?: Record<string, any>;
  }) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: params.userId ?? null,
          action: params.action,
          entity: params.entity,
          entityId: params.entityId,
          changes: params.changes ?? {},
        },
      });
    } catch (err) {
      this.logger.warn(`Failed to write audit log: ${err.message}`);
    }
  }
}
