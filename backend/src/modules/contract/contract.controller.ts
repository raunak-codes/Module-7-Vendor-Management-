import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { ContractService } from './contract.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Contracts')
@ApiBearerAuth()
@Controller('contracts')
export class ContractController {
  constructor(private contractService: ContractService) {}

  // Vendor self-access — must be before :id
  @Get('mine')
  @Roles(Role.VENDOR)
  @ApiOperation({ summary: 'Get own contracts (vendor)' })
  async getMine(@CurrentUser() user: any) {
    const data = await this.contractService.getForVendor(user.vendorId);
    return { message: 'Contracts fetched', data };
  }

  @Get('expiring')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Get contracts expiring within 30 days' })
  async getExpiring(@Query('days') days: string) {
    const data = await this.contractService.getExpiringContracts(days ? +days : 30);
    return { message: 'Expiring contracts fetched', data };
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[ADMIN] List all contracts' })
  async getAll(@Query() query: any) {
    const { contracts, pagination } = await this.contractService.getAll(query);
    return { message: 'Contracts fetched', data: contracts, pagination };
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Create a contract' })
  async create(@Body() body: any, @CurrentUser() user: any) {
    const data = await this.contractService.create(body, user.id);
    return { message: 'Contract created', data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get contract by ID' })
  async getById(@Param('id') id: string) {
    const data = await this.contractService.getById(id);
    return { message: 'Contract fetched', data };
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Update contract details' })
  async update(@Param('id') id: string, @Body() body: any, @CurrentUser() user: any) {
    const data = await this.contractService.update(id, body, user.id);
    return { message: 'Contract updated', data };
  }

  @Patch(':id/activate')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Activate a draft contract' })
  async activate(@Param('id') id: string, @CurrentUser() user: any) {
    const data = await this.contractService.activate(id, user.id);
    return { message: 'Contract activated', data };
  }

  @Patch(':id/terminate')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Terminate a contract' })
  async terminate(@Param('id') id: string, @Body() body: { reason?: string }, @CurrentUser() user: any) {
    const data = await this.contractService.terminate(id, user.id, body.reason);
    return { message: 'Contract terminated', data };
  }

  @Post(':id/slas')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Add SLA term to contract' })
  async addSla(@Param('id') id: string, @Body() body: { metric: string; target: string; penaltyPct?: number }) {
    const data = await this.contractService.addSla(id, body);
    return { message: 'SLA added', data };
  }

  @Delete('slas/:slaId')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Remove an SLA term' })
  async deleteSla(@Param('slaId') slaId: string) {
    await this.contractService.deleteSla(slaId);
    return { message: 'SLA removed' };
  }
}
