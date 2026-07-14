import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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

@Injectable()
export class RouteService {
  constructor(
    @InjectRepository(RouteEntity)
    private readonly routeRepository: Repository<RouteEntity>,
    private readonly redisService: RedisService,
  ) {}

  async create(
    projectId: string,
    environment: string,
    method: string,
    path: string,
    isAsync: boolean = false,
    timeoutMs: number = 15000,
    isMock: boolean = false,
    mockResponse: Record<string, any> | null = null,
  ): Promise<RouteEntity> {
    const route = this.routeRepository.create({
      project_id: projectId,
      environment,
      method: method.toUpperCase(),
      path,
      is_async: isAsync,
      timeout_ms: timeoutMs,
      is_mock: isMock,
      mock_response: mockResponse,
      is_active: true,
    });
    return this.routeRepository.save(route);
  }

  async findById(id: string): Promise<RouteEntity | null> {
    return this.routeRepository.findOne({ where: { id } });
  }

  async findByMatch(
    projectId: string,
    environment: string,
    method: string,
    path: string,
  ): Promise<RouteEntity | null> {
    return this.routeRepository.findOne({
      where: {
        project_id: projectId,
        environment,
        method: method.toUpperCase(),
        path,
        is_active: true,
      },
    });
  }

  async findByProjectId(projectId: string): Promise<RouteEntity[]> {
    return this.routeRepository.find({ where: { project_id: projectId } });
  }

  async update(
    id: string,
    updates: Partial<RouteEntity>,
  ): Promise<RouteEntity | null> {
    const route = await this.findById(id);
    if (!route) return null;

    Object.assign(route, updates);
    return this.routeRepository.save(route);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.routeRepository.delete(id);
    return result.affected !== undefined && result.affected !== null && result.affected > 0;
  }

  /**
   * 按 transitId（即 routeId）写路由缓存。
   * 路径模型裁决后，网关入口为 POST /v1/transit/:transitId/invoke，
   * 缓存键简化为 ddt:cache:transit:{transitId}，微秒级直读。
   */
  async cacheRoute(routeId: string, data: RouteCacheData): Promise<void> {
    const key = await this.redisService.getTransitRouteKey(routeId);
    await this.redisService.jsonSet(key, data);
  }

  /**
   * 按 transitId 读路由缓存。
   */
  async getCachedRoute(transitId: string): Promise<RouteCacheData | null> {
    const key = await this.redisService.getTransitRouteKey(transitId);
    return this.redisService.jsonGet<RouteCacheData>(key);
  }

  /**
   * 按 transitId 清路由缓存（配置热重载时调用）。
   */
  async clearCache(transitId: string): Promise<void> {
    const key = await this.redisService.getTransitRouteKey(transitId);
    await this.redisService.del(key);
  }

  async broadcastConfigReload(routeId: string): Promise<void> {
    await this.redisService.publish('ddt:channel:config_reload', JSON.stringify({ routeId }));
  }
}
