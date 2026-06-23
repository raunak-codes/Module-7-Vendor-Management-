import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService extends Redis implements OnModuleInit, OnModuleDestroy {
  constructor(private configService: ConfigService) {
    super({
      host: configService.get('REDIS_HOST', 'localhost'),
      port: configService.get<number>('REDIS_PORT', 6379),
      lazyConnect: true,
      maxRetriesPerRequest: 3,
    });
  }

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.quit();
  }

  async blacklistToken(token: string, ttlSeconds = 86400) {
    await this.set(`bl:${token}`, '1', 'EX', ttlSeconds);
  }

  async isBlacklisted(token: string): Promise<boolean> {
    return (await this.get(`bl:${token}`)) !== null;
  }

  async getCache<T>(key: string): Promise<T | null> {
    const val = await this.get(key);
    return val ? (JSON.parse(val) as T) : null;
  }

  async setCache(key: string, data: unknown, ttl = 300) {
    await this.set(key, JSON.stringify(data), 'EX', ttl);
  }

  async delCache(...keys: string[]) {
    if (keys.length) await this.del(...keys);
  }
}
