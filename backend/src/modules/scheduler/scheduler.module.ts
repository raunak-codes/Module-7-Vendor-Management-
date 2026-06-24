import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { SchedulerController } from './scheduler.controller';
import { NotificationModule } from '../notification/notification.module';
import { ContractModule } from '../contract/contract.module';

@Module({
  imports: [NotificationModule, ContractModule],
  providers: [SchedulerService],
  controllers: [SchedulerController],
})
export class SchedulerModule {}
