import { Module } from '@nestjs/common';
import { PurchaseOrderService } from './purchase-order.service';
import { PurchaseOrderController } from './purchase-order.controller';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [NotificationModule],
  providers: [PurchaseOrderService],
  controllers: [PurchaseOrderController],
})
export class PurchaseOrderModule {}
