import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private pubClient: Redis;
  private subClient: Redis;

  async onModuleInit() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    });
    this.pubClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    });
    this.subClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
    await this.pubClient.quit();
    await this.subClient.quit();
  }

  getClient(): Redis {
    return this.client;
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string | number, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.set(key, value, 'EX', ttl);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  async hget(key: string, field: string): Promise<string | null> {
    return this.client.hget(key, field);
  }

  async hset(key: string, field: string, value: string): Promise<void> {
    await this.client.hset(key, field, value);
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    return this.client.hgetall(key);
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.client.expire(key, seconds);
  }

  async publish(channel: string, message: string): Promise<void> {
    await this.pubClient.publish(channel, message);
  }

  async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    this.subClient.subscribe(channel);
    this.subClient.on('message', (ch: string, msg: string) => {
      if (ch === channel) {
        callback(msg);
      }
    });
  }

  async jsonSet(key: string, value: any): Promise<void> {
    await this.client.set(key, JSON.stringify(value));
  }

  async jsonGet<T>(key: string): Promise<T | null> {
    const result = await this.client.get(key);
    return result ? JSON.parse(result) : null;
  }

  /**
   * @deprecated 旧路径模型键（/gw/:projectId/:environment/*）。
   * 路径模型裁决后改用 transitId 入口，新代码请用 getTransitRouteKey。
   * 保留是为了向后兼容，避免破坏尚未迁移的调用方。
   */
  async getRouteKey(projectId: string, env: string, method: string, path: string): Promise<string> {
    return `ddt:cache:project:${projectId}:${env}:route:${method}:${path}`;
  }

  /**
   * 新路径模型键（对齐 SPEC-04 §2：POST /v1/transit/:transitId/invoke）。
   * transitId 即 route.id，客户端持有它即可定位整条中转配置。
   */
  async getTransitRouteKey(transitId: string): Promise<string> {
    return `ddt:cache:transit:${transitId}`;
  }

  async getRateLimitKey(routeId: string, clientIp: string): Promise<string> {
    return `ddt:rate:route:${routeId}:ip:${clientIp}`;
  }

  async getBreakerKey(routeId: string): Promise<string> {
    return `ddt:breaker:${routeId}`;
  }

  /**
   * 获取熔断器 60s 滑动窗口 ZSET key（对齐 SPEC-03 §2 #L103）
   */
  async getBreakerWindowKey(routeId: string): Promise<string> {
    return `ddt:breaker:${routeId}:window`;
  }

  // ===== ZSET 操作（用于熔断器滑动窗口）=====

  async zadd(key: string, score: number, member: string): Promise<void> {
    await this.client.zadd(key, score, member);
  }

  async zremrangebyscore(key: string, min: number, max: number): Promise<void> {
    await this.client.zremrangebyscore(key, min, max);
  }

  async zcard(key: string): Promise<number> {
    return this.client.zcard(key);
  }

  async zcount(key: string, min: number, max: number): Promise<number> {
    return this.client.zcount(key, min, max);
  }

  async zrem(key: string, member: string): Promise<void> {
    await this.client.zrem(key, member);
  }

  // ===== JWT 黑名单操作（对齐 SPEC-05 §4.3 / §4.4）=====

  /**
   * 获取 JWT 黑名单 key（基于 jti）
   * 键空间：ddt:auth:blacklist:{jti}
   */
  async getBlacklistKey(jti: string): Promise<string> {
    return `ddt:auth:blacklist:${jti}`;
  }

  /** 将 jti 加入黑名单，TTL 为剩余有效期（秒） */
  async setBlacklist(jti: string, ttlSec: number): Promise<void> {
    await this.client.set(await this.getBlacklistKey(jti), '1', 'EX', ttlSec);
  }

  /** 检查 jti 是否在黑名单中 */
  async isBlacklisted(jti: string): Promise<boolean> {
    const result = await this.client.exists(await this.getBlacklistKey(jti));
    return result === 1;
  }

  /** 从黑名单移除 jti（极少用，主要供测试） */
  async delBlacklist(jti: string): Promise<void> {
    await this.client.del(await this.getBlacklistKey(jti));
  }

  // ===== 登录失败限流（对齐 SPEC-05 §8）=====

  /** 登录失败计数 key：ddt:rate:login_fail:{ip} */
  async getLoginFailKey(ip: string): Promise<string> {
    return `ddt:rate:login_fail:${ip}`;
  }

  /** 登录失败计数 +1，返回当前窗口内累计失败次数；首次失败设置窗口 TTL */
  async incrLoginFail(ip: string, windowSec: number): Promise<number> {
    const key = await this.getLoginFailKey(ip);
    const count = await this.client.incr(key);
    if (count === 1) {
      await this.client.expire(key, windowSec);
    }
    return count;
  }

  /** 重置登录失败计数（登录成功时调用） */
  async resetLoginFail(ip: string): Promise<void> {
    await this.client.del(await this.getLoginFailKey(ip));
  }

  /** 查询当前 IP 登录失败次数 */
  async getLoginFailCount(ip: string): Promise<number> {
    const v = await this.client.get(await this.getLoginFailKey(ip));
    return v ? parseInt(v, 10) : 0;
  }
}
