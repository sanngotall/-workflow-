import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { ConfigService } from '../config/config.service';

@Injectable()
export class RateLimiterService {
  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  async check(routeId: string, clientIp: string): Promise<boolean> {
    const key = await this.redisService.getRateLimitKey(routeId, clientIp);
    const count = await this.redisService.incr(key);

    if (count === 1) {
      await this.redisService.expire(key, 60);
    }

    return count <= this.configService.rateLimitPerMinute;
  }

  async getCount(routeId: string, clientIp: string): Promise<number> {
    const key = await this.redisService.getRateLimitKey(routeId, clientIp);
    const count = await this.redisService.get(key);
    return parseInt(count || '0');
  }
}
