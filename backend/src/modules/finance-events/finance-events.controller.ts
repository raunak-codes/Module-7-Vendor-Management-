import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { FinanceEventsService } from './finance-events.service';

@ApiTags('Finance Events')
@ApiBearerAuth()
@Controller('finance-events')
@Roles(Role.ADMIN)
export class FinanceEventsController {
  constructor(private financeEventsService: FinanceEventsService) {}

  @Get('summary')
  @ApiOperation({ summary: '[ADMIN] Finance event summary / webhook stats' })
  async getSummary() {
    const data = await this.financeEventsService.getSummary();
    return { message: 'Finance event summary', data };
  }

  @Get()
  @ApiOperation({ summary: '[ADMIN] List all finance events' })
  async getAll(@Query() query: any) {
    const { events, pagination } = await this.financeEventsService.getAll(query);
    return { message: 'Finance events fetched', data: events, pagination };
  }
}
