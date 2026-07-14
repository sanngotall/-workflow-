import { Repository } from 'typeorm';
import { RouteEntity } from './route.entity';
import { RedisService } from '../redis/redis.service';
export interface RouteCacheData {
    route: RouteEntity;
    transformer?: any;
    credential?: {
        type: string;
        secret: string;
    };
}
export declare class RouteService {
    private readonly routeRepository;
    private readonly redisService;
    constructor(routeRepository: Repository<RouteEntity>, redisService: RedisService);
    create(projectId: string, environment: string, method: string, path: string, isAsync?: boolean, timeoutMs?: number, isMock?: boolean, mockResponse?: Record<string, any> | null): Promise<RouteEntity>;
    findById(id: string): Promise<RouteEntity | null>;
    findByMatch(projectId: string, environment: string, method: string, path: string): Promise<RouteEntity | null>;
    findByProjectId(projectId: string): Promise<RouteEntity[]>;
    update(id: string, updates: Partial<RouteEntity>): Promise<RouteEntity | null>;
    delete(id: string): Promise<boolean>;
    cacheRoute(routeId: string, data: RouteCacheData): Promise<void>;
    getCachedRoute(transitId: string): Promise<RouteCacheData | null>;
    clearCache(transitId: string): Promise<void>;
    broadcastConfigReload(routeId: string): Promise<void>;
}
