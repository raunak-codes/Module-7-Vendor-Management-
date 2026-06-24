import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService extends Redis implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private redisAvailable = false;

  constructor(private configService: ConfigService) {
    super({
      host: configService.get('REDIS_HOST', 'localhost'),
      port: configService.get<number>('REDIS_PORT', 6379),
      lazyConnect: true,
      maxRetriesPerRequest: 0,
      retryStrategy: () => null,
      enableOfflineQueue: false,
    });
  }

  async onModuleInit() {
    try {
      await this.connect();
      this.redisAvailable = true;
      this.logger.log('Redis connected');
    } catch (err) {
      this.logger.warn(`Redis unavailable (${err.message}) — token blacklisting disabled`);
    }
  }

  async onModuleDestroy() {
    try { await this.quit(); } catch {}
  }

  async blacklistToken(token: string, ttlSeconds = 86400) {
    if (!this.redisAvailable) return;
    try { await this.set(`bl:${token}`, '1', 'EX', ttlSeconds); } catch {}
  }

  async isBlacklisted(token: string): Promise<boolean> {
    if (!this.redisAvailable) return false;
    try { return (await this.get(`bl:${token}`)) !== null; } catch { return false; }
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
