import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private client: Minio.Client;
  private bucket: string;

  constructor(private config: ConfigService) {
    this.bucket = config.get<string>('MINIO_BUCKET', 'vendor-docs');
    this.client = new Minio.Client({
      endPoint: config.get<string>('MINIO_ENDPOINT', 'localhost'),
      port: config.get<number>('MINIO_PORT', 9000),
      useSSL: config.get<string>('MINIO_USE_SSL') === 'true',
      accessKey: config.get<string>('MINIO_ACCESS_KEY', ''),
      secretKey: config.get<string>('MINIO_SECRET_KEY', ''),
    });
  }

  async onModuleInit() {
    const exists = await this.client.bucketExists(this.bucket);
    if (!exists) {
      await this.client.makeBucket(this.bucket);
      this.logger.log(`MinIO bucket "${this.bucket}" created`);
    } else {
      this.logger.log(`MinIO connected — bucket "${this.bucket}" ready`);
    }
  }

  async upload(file: Express.Multer.File, folder = 'kyc'): Promise<string> {
    const ext = path.extname(file.originalname).toLowerCase();
    const objectName = `${folder}/${uuidv4()}${ext}`;
    await this.client.putObject(this.bucket, objectName, file.buffer, file.size, {
      'Content-Type': file.mimetype,
      'Original-Name': file.originalname,
    });
    return objectName;
  }

  async getPresignedUrl(objectName: string, expirySeconds = 3600): Promise<string> {
    return this.client.presignedGetObject(this.bucket, objectName, expirySeconds);
  }

  async delete(objectName: string): Promise<void> {
    await this.client.removeObject(this.bucket, objectName);
  }
}
