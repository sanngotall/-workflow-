import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators';

/**
 * 健康检查端点（对齐 SPEC-07 INVARIANT-15）
 * 供 Docker healthcheck 与 nginx /health 探活使用
 */
@Controller('health')
@Public()
export class HealthController {
  @Get()
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
