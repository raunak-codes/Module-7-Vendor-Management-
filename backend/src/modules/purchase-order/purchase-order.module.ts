import { Module } from '@nestjs/common';
import { PurchaseOrderService } from './purchase-order.service';
import { PurchaseOrderController } from './purchase-order.controller';
import { NotificationModule } from '../notification/notification.module';
import { FinanceEventsModule } from '../finance-events/finance-events.module';

@Module({
  imports: [NotificationModule, FinanceEventsModule],
  providers: [PurchaseOrderService],
  controllers: [PurchaseOrderController],
})
export class PurchaseOrderModule {}
