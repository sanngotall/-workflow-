import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RouteEntity } from '../routes/route.entity';
import { TransformerEntity } from '../transformers/transformer.entity';
import { CredentialEntity } from '../credentials/credential.entity';
import { RouteService, RouteCacheData } from '../routes/route.service';
import { TransformerService } from '../transformers/transformer.service';
import { CredentialService } from '../credentials/credential.service';
import { RedisService } from '../redis/redis.service';

interface CreateRouteWithTransformerDto {
  project_id: string;
  environment: string;
  method: string;
  path: string;
  is_async?: boolean;
  timeout_ms?: number;
  /** Mock 模式开关（对齐 SPEC-00 IN-SCOPE 第 6 项） */
  is_mock?: boolean;
  /** Mock 静态响应体，is_mock=true 时必填 */
  mock_response?: Record<string, any> | null;
  transformer: {
    credential_id?: string;
    target_url: string;
    type: string;
    mapping_rules?: Record<string, any>;
    script_code?: string;
    response_rules?: Record<string, any>;
  };
}

@Injectable()
export class AdminService {
  constructor(
    private readonly routeService: RouteService,
    private readonly transformerService: TransformerService,
    private readonly credentialService: CredentialService,
    private readonly redisService: RedisService,
  ) {}

  async createRouteWithTransformer(dto: CreateRouteWithTransformerDto): Promise<{ route_id: string; status: string }> {
    const route = await this.routeService.create(
      dto.project_id,
      dto.environment,
      dto.method,
      dto.path,
      dto.is_async,
      dto.timeout_ms,
      dto.is_mock,
      dto.mock_response,
    );

    await this.transformerService.create(
      route.id,
      dto.transformer.target_url,
      dto.transformer.type,
      dto.transformer.credential_id,
      dto.transformer.mapping_rules,
      dto.transformer.script_code,
      dto.transformer.response_rules,
    );

    await this.updateRouteCache(route.id);

    await this.routeService.broadcastConfigReload(route.id);

    return {
      route_id: route.id,
      status: 'ACTIVE',
    };
  }

  private async updateRouteCache(routeId: string): Promise<void> {
    const route = await this.routeService.findById(routeId);
    if (!route) return;

    const transformer = await this.transformerService.findByRouteId(routeId);

    let credentialInfo: any = null;
    if (transformer?.credential_id) {
      const credential = await this.credentialService.findById(transformer.credential_id);
      if (credential) {
        const secret = await this.credentialService.getDecryptedSecret(credential.id);
        credentialInfo = {
          type: credential.type,
          secret,
        };
      }
    }

    const cacheData: RouteCacheData = {
      route,
      transformer,
      credential: credentialInfo,
    };

    await this.routeService.cacheRoute(routeId, cacheData);
  }
}
