import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import { GlobalRolesService } from './global-roles.service';
import { RequireGlobalRole } from '../common/decorators';
import { CurrentUser } from '../common/current-user.decorator';
import { IsIn, IsString } from 'class-validator';

export class GrantRoleDto {
  @IsString()
  @IsIn(['super_admin', 'admin'])
  role: string;
}

/**
 * 全局角色管理接口（对齐 SPEC-05 §3.2）
 *
 * 路由前缀 /api/users/:id/roles
 *
 * 仅 super_admin 可操作。
 */
@Controller('users/:id/roles')
export class GlobalRolesController {
  constructor(private readonly rolesService: GlobalRolesService) {}

  /** 查询用户的全局角色（任意已登录用户可查自己，super_admin 可查任意人） */
  @Get()
  async list(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.rolesService.listByUser(id);
    return { success: true, data, error: null };
  }

  /** 授予全局角色（仅 super_admin） */
  @Post()
  @RequireGlobalRole('super_admin')
  async grant(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: GrantRoleDto,
    @CurrentUser('userId') operatorId: string,
  ) {
    const data = await this.rolesService.grant(id, dto.role, operatorId);
    return { success: true, data, error: null };
  }

  /** 撤销全局角色（仅 super_admin） */
  @Delete(':role')
  @RequireGlobalRole('super_admin')
  async revoke(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('role') role: string,
    @CurrentUser('userId') operatorId: string,
  ) {
    await this.rolesService.revoke(id, role, operatorId);
    return { success: true, data: null, error: null };
  }
}
