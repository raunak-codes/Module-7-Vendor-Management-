import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { NotificationModule } from '../notification/notification.module';
import { FinanceEventsModule } from '../finance-events/finance-events.module';

@Module({ imports: [NotificationModule, FinanceEventsModule], providers: [InvoiceService], controllers: [InvoiceController] })
export class InvoiceModule {}
