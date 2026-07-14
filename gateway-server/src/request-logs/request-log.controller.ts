import { Controller, Get, Param, Query } from '@nestjs/common';
import { RequestLogService, LogStats } from './request-log.service';
import { RequestLogEntity } from './request-log.entity';

/**
 * 请求日志控制器（对齐 SPEC-04 §7 Live-Console API）
 *
 * 暴露 2 个接口：
 * 1. GET /api/admin/v1/projects/:projectId/logs — 分页查询日志（支持筛选）
 * 2. GET /api/admin/v1/projects/:projectId/logs/stats — 聚合统计（用于 DashboardOverview）
 *
 * 路径前缀双层说明：main.ts 全局 /api + Controller 'api/admin/v1/projects' → 实际 /api/api/admin/v1/projects
 * 与前端 http.ts 拦截器约定一致
 */
@Controller('api/admin/v1/projects/:projectId/logs')
export class RequestLogController {
  constructor(private readonly requestLogService: RequestLogService) {}

  /**
   * 分页查询日志
   * 支持 routeId / method / httpStatus / errorCode 筛选
   */
  @Get()
  async listLogs(
    @Param('projectId') projectId: string,
    @Query('routeId') routeId?: string,
    @Query('method') method?: string,
    @Query('httpStatus') httpStatus?: string,
    @Query('errorCode') errorCode?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const result = await this.requestLogService.listLogs({
      projectId,
      routeId,
      method,
      httpStatus: httpStatus ? parseInt(httpStatus, 10) : undefined,
      errorCode,
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
    });

    return {
      success: true,
      data: {
        rows: result.rows,
        total: result.total,
        limit: limit ? parseInt(limit, 10) : 50,
        offset: offset ? parseInt(offset, 10) : 0,
      },
      error: null,
    };
  }

  /**
   * 聚合统计（用于 DashboardOverview）
   * 默认统计最近 24 小时数据，可通过 sinceHours 调整
   */
  @Get('stats')
  async getStats(
    @Param('projectId') projectId: string,
    @Query('sinceHours') sinceHours?: string,
  ): Promise<{ success: true; data: LogStats; error: null }> {
    const stats = await this.requestLogService.getStats(
      projectId,
      sinceHours ? parseInt(sinceHours, 10) : 24,
    );

    return {
      success: true,
      data: stats,
      error: null,
    };
  }
}
