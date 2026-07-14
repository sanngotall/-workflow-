"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CircuitBreakerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreakerService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../redis/redis.service");
let CircuitBreakerService = CircuitBreakerService_1 = class CircuitBreakerService {
    constructor(redisService) {
        this.redisService = redisService;
        this.logger = new common_1.Logger(CircuitBreakerService_1.name);
        this.COOLDOWN_PERIOD = 60000;
        this.FAILURE_THRESHOLD = 0.5;
        this.WINDOW_SIZE = 60000;
        this.HALF_OPEN_SUCCESS_COUNT = 10;
        this.HALF_OPEN_FAILURE_COUNT = 1;
        this.MIN_WINDOW_EVENTS = 10;
    }
    async getState(routeId) {
        const key = await this.redisService.getBreakerKey(routeId);
        const data = await this.redisService.hgetall(key);
        if (!data || !data.status) {
            return 'CLOSED';
        }
        const status = data.status;
        if (status === 'OPEN') {
            const openSince = parseInt(data.openSince || '0');
            const now = Date.now();
            if (now - openSince >= this.COOLDOWN_PERIOD) {
                await this.setState(routeId, 'HALF_OPEN');
                return 'HALF_OPEN';
            }
        }
        return status;
    }
    async setState(routeId, state) {
        const key = await this.redisService.getBreakerKey(routeId);
        const now = Date.now();
        await this.redisService.hset(key, 'status', state);
        if (state === 'OPEN') {
            await this.redisService.hset(key, 'openSince', now.toString());
            await this.redisService.hset(key, 'successCount', '0');
            const windowKey = await this.redisService.getBreakerWindowKey(routeId);
            await this.redisService.del(windowKey);
        }
        else if (state === 'CLOSED') {
            await this.redisService.hset(key, 'successCount', '0');
            const windowKey = await this.redisService.getBreakerWindowKey(routeId);
            await this.redisService.del(windowKey);
        }
    }
    async recordSuccess(routeId) {
        const key = await this.redisService.getBreakerKey(routeId);
        const data = await this.redisService.hgetall(key);
        const currentState = data.status || 'CLOSED';
        if (currentState === 'HALF_OPEN') {
            const successCount = parseInt(data.successCount || '0') + 1;
            await this.redisService.hset(key, 'successCount', successCount.toString());
            if (successCount >= this.HALF_OPEN_SUCCESS_COUNT) {
                await this.setState(routeId, 'CLOSED');
            }
        }
        else if (currentState === 'CLOSED') {
            const windowKey = await this.redisService.getBreakerWindowKey(routeId);
            const now = Date.now();
            const member = `s:${now}:${Math.random().toString(36).slice(2, 8)}`;
            await this.redisService.zadd(windowKey, now, member);
            await this.redisService.zremrangebyscore(windowKey, 0, now - this.WINDOW_SIZE);
            await this.redisService.expire(windowKey, 120);
        }
    }
    async recordFailure(routeId, errorType) {
        const key = await this.redisService.getBreakerKey(routeId);
        const data = await this.redisService.hgetall(key);
        const currentState = data.status || 'CLOSED';
        if (currentState === 'HALF_OPEN') {
            await this.setState(routeId, 'OPEN');
            return;
        }
        if (currentState === 'CLOSED') {
            const windowKey = await this.redisService.getBreakerWindowKey(routeId);
            const now = Date.now();
            const member = `f:${now}:${Math.random().toString(36).slice(2, 8)}`;
            await this.redisService.zadd(windowKey, now, member);
            await this.redisService.zremrangebyscore(windowKey, 0, now - this.WINDOW_SIZE);
            await this.redisService.expire(windowKey, 120);
            const totalCount = await this.redisService.zcard(windowKey);
            const failCountKey = `${windowKey}:fail`;
            const failCount = await this.redisService.incr(failCountKey);
            if (failCount === 1) {
                await this.redisService.expire(failCountKey, 120);
            }
            if (totalCount >= this.MIN_WINDOW_EVENTS && failCount / totalCount >= this.FAILURE_THRESHOLD) {
                this.logger.warn(`路由 ${routeId} 熔断器触发 OPEN：窗口内 ${failCount}/${totalCount} 失败`);
                await this.setState(routeId, 'OPEN');
            }
        }
    }
};
exports.CircuitBreakerService = CircuitBreakerService;
exports.CircuitBreakerService = CircuitBreakerService = CircuitBreakerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], CircuitBreakerService);
//# sourceMappingURL=circuit-breaker.service.js.map