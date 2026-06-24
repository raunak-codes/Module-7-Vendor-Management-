import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { PurchaseOrderService } from './purchase-order.service';
import { CreatePoDto } from './dto/create-po.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Purchase Orders')
@ApiBearerAuth()
@Controller('purchase-orders')
export class PurchaseOrderController {
  constructor(private poService: PurchaseOrderService) {}

  // Static routes before :id
  @Get('pending-approval')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[ADMIN] List POs pending approval' })
  async getPendingApproval() {
    const data = await this.poService.getPendingApproval();
    return { message: 'Pending approval POs fetched', data };
  }

  @Get()
  @ApiOperation({ summary: 'List purchase orders (admin sees all, vendor sees own)' })
  async getAll(@CurrentUser() user: any, @Query() query: any) {
    const { pos, pagination } = await this.poService.getAll(user, query);
    return { message: 'Purchase orders fetched', data: pos, pagination };
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Create a purchase order (auto-approved if < ₹1k, else queued for approval)' })
  async create(@Body() dto: CreatePoDto, @CurrentUser() user: any) {
    const data = await this.poService.create(dto, user.id);
    return { message: 'Purchase order created', data };
  }

  // Parameterized routes
  @Get(':id')
  @ApiOperation({ summary: 'Get a single purchase order' })
  async getById(@Param('id') id: string, @CurrentUser() user: any) {
    const data = await this.poService.getById(id, user);
    return { message: 'Purchase order fetched', data };
  }

  @Patch(':id/approve')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Approve a pending PO and dispatch to vendor' })
  async approve(@Param('id') id: string, @CurrentUser() user: any) {
    const data = await this.poService.approve(id, user.id);
    return { message: 'Purchase order approved and issued', data };
  }

  @Patch(':id/reject-approval')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Reject a pending PO with reason' })
  async rejectApproval(@Param('id') id: string, @Body() body: { reason: string }, @CurrentUser() user: any) {
    const data = await this.poService.rejectApproval(id, user.id, body.reason);
    return { message: 'Purchase order approval rejected', data };
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update PO status (vendor: accept/reject; admin: cancel/fulfil)' })
  async updateStatus(@Param('id') id: string, @Body() body: { status: string; reason?: string }, @CurrentUser() user: any) {
    const data = await this.poService.updateStatus(id, body.status, user, body.reason);
    return { message: `Purchase order ${body.status.toLowerCase()}`, data };
  }
}
