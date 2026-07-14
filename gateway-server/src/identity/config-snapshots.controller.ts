import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ConfigSnapshotsService,
  CredentialAuditLogsService,
} from './config-snapshots.service';
import { RequirePermission, RequireGlobalRole } from '../common/decorators';
import { CurrentUser } from '../common/current-user.decorator';
import { IsString, MinLength, IsOptional, MaxLength } from 'class-validator';

export class CreateSnapshotDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  version: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  snapshot_json?: Record<string, any>;
}

/**
 * 配置快照接口（对齐 SPEC-05 §3.1）
 *
 * 路由前缀 /api/projects/:projectId/snapshots
 */
@Controller('projects/:projectId/snapshots')
export class ConfigSnapshotsController {
  constructor(private readonly snapshotsService: ConfigSnapshotsService) {}

  /** 列出项目配置快照 */
  @Get()
  @RequirePermission('snapshot:export')
  async list(@Param('projectId', ParseUUIDPipe) projectId: string) {
    const data = await this.snapshotsService.list(projectId);
    return { success: true, data, error: null };
  }

  /** 创建配置快照（导出当前配置） */
  @Post()
  @RequirePermission('snapshot:export')
  async create(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: CreateSnapshotDto,
    @CurrentUser('userId') creatorId: string,
  ) {
    // TODO: 真正的快照导出需调用 ProjectsService/RoutesService 等汇总数据
    // 当前为占位实现，仅记录空快照
    const data = await this.snapshotsService.create(
      projectId,
      dto.version,
      dto.description ?? null,
      dto.snapshot_json ?? { _placeholder: true },
      creatorId,
    );
    return { success: true, data, error: null };
  }
}

/**
 * 凭证审计日志接口（对齐 SPEC-05 §8）
 *
 * 路由前缀 /api/audit-logs/credentials
 * 仅 super_admin/admin 可查询
 */
@Controller('audit-logs/credentials')
export class CredentialAuditLogsController {
  constructor(private readonly auditService: CredentialAuditLogsService) {}

  @Get()
  @RequireGlobalRole('super_admin', 'admin')
  async list(
    @Query('credential_id') credential_id?: string,
    @Query('user_id') user_id?: string,
    @Query('action') action?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const data = await this.auditService.list({
      credential_id,
      user_id,
      action,
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 20,
    });
    return { success: true, data, error: null };
  }
}
