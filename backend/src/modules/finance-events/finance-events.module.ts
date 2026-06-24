import { Module } from '@nestjs/common';
import { FinanceEventsService } from './finance-events.service';
import { FinanceEventsController } from './finance-events.controller';

@Module({
  providers: [FinanceEventsService],
  controllers: [FinanceEventsController],
  exports: [FinanceEventsService],
})
export class FinanceEventsModule {}
