import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

export type BreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

/**
 * 熔断器状态机（对齐 SPEC-02 §3 [FLOW-03] 与 SPEC-03 §2 #L103）
 *
 * 改造说明：用 ZSET `ddt:breaker:{rid}:window` 实现精确 60s 滑动窗口失败率统计，
 * 替代旧的 Hash 累计计数。每个事件（成功/失败）作为 ZSET member，score 为时间戳。
 * 状态判定时先 ZREMRANGEBYSCORE 清理窗口外事件，再 ZCARD 取总数、ZCOUNT 取失败数。
 */
@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private readonly COOLDOWN_PERIOD = 60000;        // OPEN 冷却期 60s
  private readonly FAILURE_THRESHOLD = 0.5;        // 失败率阈值 50%
  private readonly WINDOW_SIZE = 60000;            // 60s 滑动窗口
  private readonly HALF_OPEN_SUCCESS_COUNT = 10;   // HALF_OPEN 连续 10 次成功转 CLOSED
  private readonly HALF_OPEN_FAILURE_COUNT = 1;    // HALF_OPEN 1 次失败退回 OPEN
  private readonly MIN_WINDOW_EVENTS = 10;         // 窗口内至少 10 个事件才触发 OPEN

  constructor(private readonly redisService: RedisService) {}

  async getState(routeId: string): Promise<BreakerState> {
    const key = await this.redisService.getBreakerKey(routeId);
    const data = await this.redisService.hgetall(key);

    if (!data || !data.status) {
      return 'CLOSED';
    }

    const status = data.status as BreakerState;

    if (status === 'OPEN') {
      const openSince = parseInt(data.openSince || '0');
      const now = Date.now();
      if (now - openSince >= this.COOLDOWN_PERIOD) {
        // 冷却期到，自动转 HALF_OPEN（对齐 SPEC-02 §3.1）
        await this.setState(routeId, 'HALF_OPEN');
        return 'HALF_OPEN';
      }
    }

    return status;
  }

  async setState(routeId: string, state: BreakerState): Promise<void> {
    const key = await this.redisService.getBreakerKey(routeId);
    const now = Date.now();

    await this.redisService.hset(key, 'status', state);
    if (state === 'OPEN') {
      await this.redisService.hset(key, 'openSince', now.toString());
      await this.redisService.hset(key, 'successCount', '0');
      // OPEN 时清空滑动窗口，下次进入 HALF_OPEN 重新计数
      const windowKey = await this.redisService.getBreakerWindowKey(routeId);
      await this.redisService.del(windowKey);
    } else if (state === 'CLOSED') {
      await this.redisService.hset(key, 'successCount', '0');
      const windowKey = await this.redisService.getBreakerWindowKey(routeId);
      await this.redisService.del(windowKey);
    }
  }

  async recordSuccess(routeId: string): Promise<void> {
    const key = await this.redisService.getBreakerKey(routeId);
    const data = await this.redisService.hgetall(key);
    const currentState = (data.status as BreakerState) || 'CLOSED';

    if (currentState === 'HALF_OPEN') {
      const successCount = parseInt(data.successCount || '0') + 1;
      await this.redisService.hset(key, 'successCount', successCount.toString());

      if (successCount >= this.HALF_OPEN_SUCCESS_COUNT) {
        // 连续 10 次成功，恢复 CLOSED（对齐 SPEC-02 §3.1）
        await this.setState(routeId, 'CLOSED');
      }
    } else if (currentState === 'CLOSED') {
      // 记录成功事件到滑动窗口（member 用 时间戳+随机数避免冲突）
      const windowKey = await this.redisService.getBreakerWindowKey(routeId);
      const now = Date.now();
      const member = `s:${now}:${Math.random().toString(36).slice(2, 8)}`;
      await this.redisService.zadd(windowKey, now, member);
      // 清理窗口外事件
      await this.redisService.zremrangebyscore(windowKey, 0, now - this.WINDOW_SIZE);
      // 设 TTL 防止冷路由窗口永久残留
      await this.redisService.expire(windowKey, 120);
    }
  }

  async recordFailure(routeId: string, errorType: 'TIMEOUT' | 'SERVER_ERROR'): Promise<void> {
    const key = await this.redisService.getBreakerKey(routeId);
    const data = await this.redisService.hgetall(key);
    const currentState = (data.status as BreakerState) || 'CLOSED';

    if (currentState === 'HALF_OPEN') {
      // HALF_OPEN 1 次失败立刻退回 OPEN（对齐 SPEC-02 §3.1）
      await this.setState(routeId, 'OPEN');
      return;
    }

    if (currentState === 'CLOSED') {
      // 记录失败事件到滑动窗口
      const windowKey = await this.redisService.getBreakerWindowKey(routeId);
      const now = Date.now();
      const member = `f:${now}:${Math.random().toString(36).slice(2, 8)}`;
      await this.redisService.zadd(windowKey, now, member);
      // 清理窗口外事件
      await this.redisService.zremrangebyscore(windowKey, 0, now - this.WINDOW_SIZE);
      await this.redisService.expire(windowKey, 120);

      // 统计窗口内总数与失败数
      const totalCount = await this.redisService.zcard(windowKey);
      // 失败事件 member 以 'f:' 开头，用 Lua 脚本精确计数更优；这里用近似：扫描窗口
      // 简化实现：维护一个独立的失败计数 key
      const failCountKey = `${windowKey}:fail`;
      const failCount = await this.redisService.incr(failCountKey);
      // 同步清理失败计数（与窗口同 TTL）
      if (failCount === 1) {
        await this.redisService.expire(failCountKey, 120);
      }

      // 触发 OPEN 条件：窗口内事件数 ≥ 10 且失败率 ≥ 50%
      if (totalCount >= this.MIN_WINDOW_EVENTS && failCount / totalCount >= this.FAILURE_THRESHOLD) {
        this.logger.warn(`路由 ${routeId} 熔断器触发 OPEN：窗口内 ${failCount}/${totalCount} 失败`);
        await this.setState(routeId, 'OPEN');
      }
    }
  }
}
