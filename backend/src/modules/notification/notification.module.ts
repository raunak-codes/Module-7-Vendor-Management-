import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationGateway } from './notification.gateway';
import { MailerService } from './mailer.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [NotificationService, NotificationGateway, MailerService],
  controllers: [NotificationController],
  exports: [NotificationService],
})
export class NotificationModule {}
