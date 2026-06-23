import { Module } from '@nestjs/common';
import { WorkOrderService } from './work-order.service';
import { WorkOrderController } from './work-order.controller';
import { NotificationModule } from '../notification/notification.module';

@Module({ imports: [NotificationModule], providers: [WorkOrderService], controllers: [WorkOrderController] })
export class WorkOrderModule {}
