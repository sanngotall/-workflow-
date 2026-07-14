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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiterService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../redis/redis.service");
const config_service_1 = require("../config/config.service");
let RateLimiterService = class RateLimiterService {
    constructor(redisService, configService) {
        this.redisService = redisService;
        this.configService = configService;
    }
    async check(routeId, clientIp) {
        const key = await this.redisService.getRateLimitKey(routeId, clientIp);
        const count = await this.redisService.incr(key);
        if (count === 1) {
            await this.redisService.expire(key, 60);
        }
        return count <= this.configService.rateLimitPerMinute;
    }
    async getCount(routeId, clientIp) {
        const key = await this.redisService.getRateLimitKey(routeId, clientIp);
        const count = await this.redisService.get(key);
        return parseInt(count || '0');
    }
};
exports.RateLimiterService = RateLimiterService;
exports.RateLimiterService = RateLimiterService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        config_service_1.ConfigService])
], RateLimiterService);
//# sourceMappingURL=rate-limiter.service.js.map