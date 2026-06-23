import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './modules/redis/redis.module';
import { MinioModule } from './modules/minio/minio.module';

import { AuthModule } from './modules/auth/auth.module';
import { VendorModule } from './modules/vendor/vendor.module';
import { KycModule } from './modules/kyc/kyc.module';
import { NotificationModule } from './modules/notification/notification.module';
import { PurchaseOrderModule } from './modules/purchase-order/purchase-order.module';
import { WorkOrderModule } from './modules/work-order/work-order.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { RatingModule } from './modules/rating/rating.module';
import { AuditModule } from './modules/audit/audit.module';

import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 30 }]),
    PrismaModule,
    RedisModule,
    MinioModule,
    AuthModule,
    VendorModule,
    KycModule,
    NotificationModule,
    PurchaseOrderModule,
    WorkOrderModule,
    InvoiceModule,
    RatingModule,
    AuditModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  ],
})
export class AppModule {}
