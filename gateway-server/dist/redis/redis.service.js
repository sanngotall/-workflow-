"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = __importDefault(require("ioredis"));
let RedisService = class RedisService {
    async onModuleInit() {
        this.client = new ioredis_1.default({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
        });
        this.pubClient = new ioredis_1.default({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
        });
        this.subClient = new ioredis_1.default({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
        });
    }
    async onModuleDestroy() {
        await this.client.quit();
        await this.pubClient.quit();
        await this.subClient.quit();
    }
    getClient() {
        return this.client;
    }
    async get(key) {
        return this.client.get(key);
    }
    async set(key, value, ttl) {
        if (ttl) {
            await this.client.set(key, value, 'EX', ttl);
        }
        else {
            await this.client.set(key, value);
        }
    }
    async del(key) {
        await this.client.del(key);
    }
    async exists(key) {
        const result = await this.client.exists(key);
        return result === 1;
    }
    async hget(key, field) {
        return this.client.hget(key, field);
    }
    async hset(key, field, value) {
        await this.client.hset(key, field, value);
    }
    async hgetall(key) {
        return this.client.hgetall(key);
    }
    async incr(key) {
        return this.client.incr(key);
    }
    async expire(key, seconds) {
        await this.client.expire(key, seconds);
    }
    async publish(channel, message) {
        await this.pubClient.publish(channel, message);
    }
    async subscribe(channel, callback) {
        this.subClient.subscribe(channel);
        this.subClient.on('message', (ch, msg) => {
            if (ch === channel) {
                callback(msg);
            }
        });
    }
    async jsonSet(key, value) {
        await this.client.set(key, JSON.stringify(value));
    }
    async jsonGet(key) {
        const result = await this.client.get(key);
        return result ? JSON.parse(result) : null;
    }
    async getRouteKey(projectId, env, method, path) {
        return `ddt:cache:project:${projectId}:${env}:route:${method}:${path}`;
    }
    async getTransitRouteKey(transitId) {
        return `ddt:cache:transit:${transitId}`;
    }
    async getRateLimitKey(routeId, clientIp) {
        return `ddt:rate:route:${routeId}:ip:${clientIp}`;
    }
    async getBreakerKey(routeId) {
        return `ddt:breaker:${routeId}`;
    }
    async getBreakerWindowKey(routeId) {
        return `ddt:breaker:${routeId}:window`;
    }
    async zadd(key, score, member) {
        await this.client.zadd(key, score, member);
    }
    async zremrangebyscore(key, min, max) {
        await this.client.zremrangebyscore(key, min, max);
    }
    async zcard(key) {
        return this.client.zcard(key);
    }
    async zcount(key, min, max) {
        return this.client.zcount(key, min, max);
    }
    async zrem(key, member) {
        await this.client.zrem(key, member);
    }
    async getBlacklistKey(jti) {
        return `ddt:auth:blacklist:${jti}`;
    }
    async setBlacklist(jti, ttlSec) {
        await this.client.set(await this.getBlacklistKey(jti), '1', 'EX', ttlSec);
    }
    async isBlacklisted(jti) {
        const result = await this.client.exists(await this.getBlacklistKey(jti));
        return result === 1;
    }
    async delBlacklist(jti) {
        await this.client.del(await this.getBlacklistKey(jti));
    }
    async getLoginFailKey(ip) {
        return `ddt:rate:login_fail:${ip}`;
    }
    async incrLoginFail(ip, windowSec) {
        const key = await this.getLoginFailKey(ip);
        const count = await this.client.incr(key);
        if (count === 1) {
            await this.client.expire(key, windowSec);
        }
        return count;
    }
    async resetLoginFail(ip) {
        await this.client.del(await this.getLoginFailKey(ip));
    }
    async getLoginFailCount(ip) {
        const v = await this.client.get(await this.getLoginFailKey(ip));
        return v ? parseInt(v, 10) : 0;
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = __decorate([
    (0, common_1.Injectable)()
], RedisService);
//# sourceMappingURL=redis.service.js.map