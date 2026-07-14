import { Module } from '@nestjs/common';
import { RateLimiterService } from './rate-limiter.service';
import { RedisModule } from '../redis/redis.module';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [RedisModule, ConfigModule],
  providers: [RateLimiterService],
  exports: [RateLimiterService],
})
export class RateLimiterModule {}
