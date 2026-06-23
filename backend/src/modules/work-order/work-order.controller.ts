import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { WorkOrderService } from './work-order.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Work Orders')
@ApiBearerAuth()
@Controller('work-orders')
export class WorkOrderController {
  constructor(private woService: WorkOrderService) {}

  @Get() @ApiOperation({ summary: 'List work orders' })
  async getAll(@CurrentUser() user: any, @Query() query: any) {
    const { wos, pagination } = await this.woService.getAll(user, query);
    return { message: 'Work orders fetched', data: wos, pagination };
  }

  @Get(':id') @ApiOperation({ summary: 'Get a single work order' })
  async getById(@Param('id') id: string, @CurrentUser() user: any) {
    const data = await this.woService.getById(id, user);
    return { message: 'Work order fetched', data };
  }

  @Post() @Roles(Role.ADMIN) @ApiOperation({ summary: '[ADMIN] Create a work order' })
  async create(@Body() body: any) {
    const data = await this.woService.create(body);
    return { message: 'Work order created', data };
  }

  @Patch(':id/status') @ApiOperation({ summary: 'Update work order status' })
  async updateStatus(@Param('id') id: string, @Body() body: { status: string }, @CurrentUser() user: any) {
    const data = await this.woService.updateStatus(id, body.status, user);
    return { message: `Work order ${body.status.toLowerCase()}`, data };
  }
}
