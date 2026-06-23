import { Controller, Get, Patch, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationController {
  constructor(private notifService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated notifications for the current user' })
  async getAll(@CurrentUser() user: any, @Query('page') page = 1, @Query('limit') limit = 20, @Query('unreadOnly') unreadOnly?: string) {
    const result = await this.notifService.getUserNotifications(user.id, +page, +limit, unreadOnly === 'true');
    return { message: 'Notifications fetched', data: { notifications: result.notifications, unreadCount: result.unreadCount }, pagination: result.pagination };
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllRead(@CurrentUser() user: any) {
    await this.notifService.markAllRead(user.id);
    return { message: 'All notifications marked as read', data: null };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a single notification as read' })
  async markRead(@Param('id') id: string, @CurrentUser() user: any) {
    await this.notifService.markAsRead(id, user.id);
    return { message: 'Marked as read', data: null };
  }
}
