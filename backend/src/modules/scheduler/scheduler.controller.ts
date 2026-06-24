import { Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { SchedulerService } from './scheduler.service';

@ApiTags('Scheduler')
@ApiBearerAuth()
@Controller('scheduler')
@Roles(Role.ADMIN)
export class SchedulerController {
  constructor(private schedulerService: SchedulerService) {}

  @Post('trigger/kyc-expiry')
  @ApiOperation({ summary: '[ADMIN] Manually trigger KYC expiry check' })
  async triggerKyc() {
    await this.schedulerService.runKycExpiryCheck();
    return { message: 'KYC expiry check triggered' };
  }

  @Post('trigger/contract-expiry')
  @ApiOperation({ summary: '[ADMIN] Manually trigger contract expiry check' })
  async triggerContract() {
    await this.schedulerService.runContractExpiryCheck();
    return { message: 'Contract expiry check triggered' };
  }

  @Post('trigger/po-escalation')
  @ApiOperation({ summary: '[ADMIN] Manually trigger PO 48hr escalation check' })
  async triggerPo() {
    await this.schedulerService.runPoEscalation();
    return { message: 'PO escalation check triggered' };
  }

  @Post('trigger/vendor-flag')
  @ApiOperation({ summary: '[ADMIN] Manually trigger vendor rating auto-flag check' })
  async triggerVendorFlag() {
    await this.schedulerService.runVendorRatingFlag();
    return { message: 'Vendor rating flag check triggered' };
  }
}
