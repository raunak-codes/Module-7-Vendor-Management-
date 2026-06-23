import { Module } from '@nestjs/common';
import { KycService } from './kyc.service';
import { KycController } from './kyc.controller';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [NotificationModule],
  providers: [KycService],
  controllers: [KycController],
})
export class KycModule {}
