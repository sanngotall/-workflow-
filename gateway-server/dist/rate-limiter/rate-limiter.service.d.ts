import { RedisService } from '../redis/redis.service';
import { ConfigService } from '../config/config.service';
export declare class RateLimiterService {
    private readonly redisService;
    private readonly configService;
    constructor(redisService: RedisService, configService: ConfigService);
    check(routeId: string, clientIp: string): Promise<boolean>;
    getCount(routeId: string, clientIp: string): Promise<number>;
}
