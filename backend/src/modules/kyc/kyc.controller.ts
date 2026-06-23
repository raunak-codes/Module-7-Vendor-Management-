import { Controller, Post, Get, Patch, Delete, Param, Body, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { Role } from '@prisma/client';
import { KycService } from './kyc.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('KYC')
@ApiBearerAuth()
@Controller('vendors/:vendorId/kyc')
export class KycController {
  constructor(private kycService: KycService) {}

  @Post()
  @ApiOperation({ summary: 'Upload a KYC document to MinIO' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('document', { storage: memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }))
  async upload(
    @Param('vendorId') vendorId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { type: string; expiryDate?: string },
    @CurrentUser() user: any,
  ) {
    const data = await this.kycService.upload(vendorId, file, body.type as any, body.expiryDate, user);
    return { message: 'Document uploaded', data };
  }

  @Get()
  @ApiOperation({ summary: 'List KYC documents (with presigned download URLs)' })
  async getAll(@Param('vendorId') vendorId: string, @CurrentUser() user: any) {
    const data = await this.kycService.getAll(vendorId, user);
    return { message: 'Documents fetched', data };
  }

  @Get(':docId')
  @ApiOperation({ summary: 'Get a single KYC document' })
  async getOne(@Param('vendorId') vendorId: string, @Param('docId') docId: string) {
    const data = await this.kycService.getOne(vendorId, docId);
    return { message: 'Document fetched', data };
  }

  @Patch(':docId/status')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Update KYC document status' })
  async updateStatus(@Param('vendorId') vendorId: string, @Param('docId') docId: string, @Body() body: { status: string }) {
    const data = await this.kycService.updateStatus(vendorId, docId, body.status);
    return { message: `Document marked as ${body.status}`, data };
  }

  @Delete(':docId')
  @ApiOperation({ summary: 'Delete a KYC document' })
  async remove(@Param('vendorId') vendorId: string, @Param('docId') docId: string) {
    await this.kycService.remove(vendorId, docId);
    return { message: 'Document deleted', data: null };
  }
}
