import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { WxConfigService } from './wx-config.service';

/**
 * 微信小程序配置控制器
 * 路由前缀：/api/admin/v1/projects/:projectId/wx-config
 *
 * 接口清单：
 * - GET    /wx-config          获取配置（只返回 app_id + has_secret 标志）
 * - PUT    /wx-config          创建或更新配置（appId + appSecret + jwtSecret）
 * - DELETE /wx-config          删除配置
 *
 * 安全约束：响应中不返回明文 app_secret / jwt_secret
 */
@Controller('api/admin/v1/projects')
export class WxConfigController {
  constructor(private readonly wxConfigService: WxConfigService) {}

  /** 获取微信配置（脱敏响应） */
  @Get(':projectId/wx-config')
  async get(@Param('projectId') projectId: string) {
    const config = await this.wxConfigService.findByProjectId(projectId);
    if (!config) {
      return {
        success: true,
        data: null,
        error: null,
      };
    }
    return {
      success: true,
      data: {
        id: config.id,
        app_id: config.app_id,
        has_app_secret: true,
        has_jwt_secret: true,
        created_at: config.created_at,
        updated_at: config.updated_at,
      },
      error: null,
    };
  }

  /** 创建或更新微信配置（upsert） */
  @Put(':projectId/wx-config')
  async upsert(
    @Param('projectId') projectId: string,
    @Body() body: { app_id?: string; app_secret?: string; jwt_secret?: string },
  ) {
    if (!body.app_id || !body.app_secret || !body.jwt_secret) {
      throw new BadRequestException('app_id、app_secret、jwt_secret 均为必填');
    }
    const config = await this.wxConfigService.upsert(
      projectId,
      body.app_id,
      body.app_secret,
      body.jwt_secret,
    );
    return {
      success: true,
      data: {
        id: config.id,
        app_id: config.app_id,
        has_app_secret: true,
        has_jwt_secret: true,
        created_at: config.created_at,
        updated_at: config.updated_at,
      },
      error: null,
    };
  }

  /** 删除微信配置 */
  @Delete(':projectId/wx-config')
  async delete(@Param('projectId') projectId: string) {
    const deleted = await this.wxConfigService.deleteByProjectId(projectId);
    return {
      success: true,
      data: { deleted },
      error: null,
    };
  }
}
