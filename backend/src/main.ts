import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security
  app.use(helmet());

  // CORS
  const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000,http://localhost:3001').split(',');
  app.enableCors({ origin: allowedOrigins, credentials: true });

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Global validation pipe — strips unknown fields, transforms types
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false, transform: true }));

  // Socket.IO adapter
  app.useWebSocketAdapter(new IoAdapter(app));

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Vendor Management API')
    .setDescription('EventHub360 — Vendor Portal & Admin API')
    .setVersion('1.0')
    .addBearerAuth()
    .addServer(`http://localhost:${process.env.PORT ?? 5000}`)
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, { swaggerOptions: { persistAuthorization: true } });

  await app.listen(process.env.PORT ?? 5000);
  console.log(`Server running on http://localhost:${process.env.PORT ?? 5000}`);
  console.log(`Swagger docs: http://localhost:${process.env.PORT ?? 5000}/api/docs`);
}
bootstrap();
