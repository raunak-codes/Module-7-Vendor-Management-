import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('audit-logs')
export class AuditController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: '[ADMIN] Get audit logs' })
  async getAll(@Query('page') page = 1, @Query('limit') limit = 20, @Query('entity') entity?: string) {
    const where: any = {};
    if (entity) where.entity = entity;
    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (+page - 1) * +limit, take: +limit, include: { user: { select: { email: true, role: true } } } }),
      this.prisma.auditLog.count({ where }),
    ]);
    return { message: 'Audit logs fetched', data: logs, pagination: { total, page: +page, limit: +limit, totalPages: Math.ceil(total / +limit) } };
  }
}
