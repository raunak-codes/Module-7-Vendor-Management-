import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { NotificationModule } from '../notification/notification.module';

@Module({ imports: [NotificationModule], providers: [InvoiceService], controllers: [InvoiceController] })
export class InvoiceModule {}
