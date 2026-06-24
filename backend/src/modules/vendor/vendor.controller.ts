import { Controller, Get, Put, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { VendorService } from './vendor.service';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { VendorQueryDto } from './dto/vendor-query.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Vendors')
@ApiBearerAuth()
@Controller('vendors')
export class VendorController {
  constructor(private vendorService: VendorService) {}

  // ── Vendor self routes (me/*) — must come before :vendorId ──
  @Get('me')
  @Roles(Role.VENDOR)
  @ApiOperation({ summary: 'Get own vendor profile' })
  async getMe(@CurrentUser() user: any) {
    const data = await this.vendorService.getMyProfile(user.vendorId);
    return { message: 'Vendor profile fetched', data };
  }

  @Get('me/dashboard')
  @Roles(Role.VENDOR)
  @ApiOperation({ summary: 'Get vendor dashboard stats' })
  async getDashboard(@CurrentUser() user: any) {
    const data = await this.vendorService.getDashboard(user.vendorId);
    return { message: 'Dashboard data fetched', data };
  }

  @Put('me')
  @Roles(Role.VENDOR)
  @ApiOperation({ summary: 'Update own vendor profile' })
  async updateMe(@CurrentUser() user: any, @Body() dto: UpdateVendorDto) {
    const data = await this.vendorService.updateMyProfile(user.vendorId, dto);
    return { message: 'Profile updated', data };
  }

  // ── Services CRUD (me/services/*) — before :vendorId/approve etc ──
  @Get('me/services')
  @Roles(Role.VENDOR)
  @ApiOperation({ summary: 'List own services' })
  async getMyServices(@CurrentUser() user: any) {
    const data = await this.vendorService.getServices(user.vendorId);
    return { message: 'Services fetched', data };
  }

  @Post('me/services')
  @Roles(Role.VENDOR)
  @ApiOperation({ summary: 'Add a service' })
  async createService(@CurrentUser() user: any, @Body() body: any) {
    const data = await this.vendorService.createService(user.vendorId, body);
    return { message: 'Service created', data };
  }

  @Patch('me/services/:serviceId')
  @Roles(Role.VENDOR)
  @ApiOperation({ summary: 'Update a service' })
  async updateService(@CurrentUser() user: any, @Param('serviceId') serviceId: string, @Body() body: any) {
    const data = await this.vendorService.updateService(serviceId, user.vendorId, body);
    return { message: 'Service updated', data };
  }

  @Delete('me/services/:serviceId')
  @Roles(Role.VENDOR)
  @ApiOperation({ summary: 'Delete a service' })
  async deleteService(@CurrentUser() user: any, @Param('serviceId') serviceId: string) {
    await this.vendorService.deleteService(serviceId, user.vendorId);
    return { message: 'Service deleted' };
  }

  // ── Admin list/stats routes — before :vendorId param ──
  @Get('admin/dashboard')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Dashboard stats' })
  async adminDashboard() {
    const data = await this.vendorService.getAdminDashboard();
    return { message: 'Admin dashboard fetched', data };
  }

  @Get('pending')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[ADMIN] List vendors awaiting approval' })
  async getPending() {
    const data = await this.vendorService.getPending();
    return { message: 'Pending vendors fetched', data };
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[ADMIN] List all vendors with pagination, search, filters' })
  async getAll(@Query() query: VendorQueryDto) {
    const { vendors, pagination } = await this.vendorService.getAll(query);
    return { message: 'Vendors fetched', data: vendors, pagination };
  }

  // ── Parameterized :vendorId routes — must come last ──
  @Get(':vendorId')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Get a vendor by ID' })
  async getById(@Param('vendorId') vendorId: string) {
    const data = await this.vendorService.getById(vendorId);
    return { message: 'Vendor fetched', data };
  }

  @Patch(':vendorId/approve')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Approve a vendor' })
  async approve(@Param('vendorId') vendorId: string) {
    const data = await this.vendorService.approve(vendorId);
    return { message: 'Vendor approved', data };
  }

  @Patch(':vendorId/reject')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Reject a vendor application' })
  async reject(@Param('vendorId') vendorId: string, @Body() body?: { reason?: string }) {
    const data = await this.vendorService.reject(vendorId, body?.reason);
    return { message: 'Vendor rejected', data };
  }

  @Patch(':vendorId/blacklist')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Blacklist a vendor' })
  async blacklist(@Param('vendorId') vendorId: string, @Body() body: { reason: string }, @CurrentUser() user: any) {
    const data = await this.vendorService.blacklist(vendorId, body.reason, user.id);
    return { message: 'Vendor blacklisted', data };
  }
}
