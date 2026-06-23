import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { InvoiceService } from './invoice.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Invoices')
@ApiBearerAuth()
@Controller('invoices')
export class InvoiceController {
  constructor(private invoiceService: InvoiceService) {}

  @Get()
  @ApiOperation({ summary: 'List invoices (admin sees all, vendor sees own)' })
  async getAll(@CurrentUser() user: any, @Query() query: any) {
    const { invoices, pagination } = await this.invoiceService.getAll(user, query);
    return { message: 'Invoices fetched', data: invoices, pagination };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single invoice' })
  async getById(@Param('id') id: string, @CurrentUser() user: any) {
    const data = await this.invoiceService.getById(id, user);
    return { message: 'Invoice fetched', data };
  }

  @Post()
  @ApiOperation({ summary: 'Submit an invoice' })
  async create(@CurrentUser() user: any, @Body() body: any) {
    const data = await this.invoiceService.create(user, body);
    return { message: 'Invoice submitted', data };
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Update invoice status (approve, reject, mark paid)' })
  async updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    const data = await this.invoiceService.updateStatus(id, body.status);
    return { message: `Invoice marked as ${body.status}`, data };
  }
}
