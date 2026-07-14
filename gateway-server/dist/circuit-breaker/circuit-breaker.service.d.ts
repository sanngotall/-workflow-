import { RedisService } from '../redis/redis.service';
export type BreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';
export declare class CircuitBreakerService {
    private readonly redisService;
    private readonly logger;
    private readonly COOLDOWN_PERIOD;
    private readonly FAILURE_THRESHOLD;
    private readonly WINDOW_SIZE;
    private readonly HALF_OPEN_SUCCESS_COUNT;
    private readonly HALF_OPEN_FAILURE_COUNT;
    private readonly MIN_WINDOW_EVENTS;
    constructor(redisService: RedisService);
    getState(routeId: string): Promise<BreakerState>;
    setState(routeId: string, state: BreakerState): Promise<void>;
    recordSuccess(routeId: string): Promise<void>;
    recordFailure(routeId: string, errorType: 'TIMEOUT' | 'SERVER_ERROR'): Promise<void>;
}
