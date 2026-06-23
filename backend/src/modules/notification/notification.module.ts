import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationProcessor } from './notification.processor';
import { NotificationGateway } from './notification.gateway';
import { MailerService } from './mailer.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: 'notifications',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
          maxRetriesPerRequest: null,
        },
        defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 5000 }, removeOnComplete: 100, removeOnFail: 200 },
      }),
    }),
    AuthModule,
  ],
  providers: [NotificationService, NotificationProcessor, NotificationGateway, MailerService],
  controllers: [NotificationController],
  exports: [NotificationService],
})
export class NotificationModule {}
