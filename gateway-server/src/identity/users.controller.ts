import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UpdateUserStatusDto,
  ChangePasswordDto,
  AdminResetPasswordDto,
} from './users.dto';
import { RequireGlobalRole, SelfOrPermission } from '../common/decorators';
import { CurrentUser } from '../common/current-user.decorator';

/**
 * 用户管理接口（对齐 SPEC-05 §6.2）
 *
 * 路由前缀 /api/users
 *
 * 权限规则：
 * - GET /            → super_admin / admin
 * - GET /:id         → super_admin / admin / 本人
 * - POST /           → super_admin / admin（创建用户）
 * - PUT /:id         → super_admin / admin / 本人（受限）
 * - PUT /:id/status  → super_admin / admin
 * - PUT /:id/password       → 本人改自己密码
 * - PUT /:id/password/admin → super_admin / admin 重置任意用户密码
 * - DELETE /:id      → super_admin（软删除）
 */
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /** 用户列表（分页 + 搜索） */
  @Get()
  @RequireGlobalRole('super_admin', 'admin')
  async list(
    @Query('keyword') keyword?: string,
    @Query('status') status?: 'active' | 'inactive' | 'disabled',
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const data = await this.usersService.list({
      keyword,
      status,
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 20,
    });
    return { success: true, data, error: null };
  }

  /** 用户详情 */
  @Get(':id')
  @SelfOrPermission('user:read')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.usersService.findById(id);
    return { success: true, data, error: null };
  }

  /** 创建用户（仅管理员） */
  @Post()
  @RequireGlobalRole('super_admin', 'admin')
  async create(
    @Body() dto: CreateUserDto,
    @CurrentUser('userId') creatorId: string,
  ) {
    const data = await this.usersService.create(dto, creatorId);
    return { success: true, data, error: null };
  }

  /** 更新用户信息（管理员或本人） */
  @Put(':id')
  @SelfOrPermission('user:write')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser('userId') operatorId: string,
  ) {
    const isSelf = id === operatorId;
    await this.usersService.update(id, dto, operatorId, isSelf);
    return { success: true, data: null, error: null };
  }

  /** 更新用户状态（仅管理员） */
  @Put(':id/status')
  @RequireGlobalRole('super_admin', 'admin')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser('userId') operatorId: string,
    @CurrentUser('globalRoles') operatorGlobalRoles: string[],
  ) {
    await this.usersService.updateStatus(
      id,
      dto,
      operatorId,
      operatorGlobalRoles as any,
    );
    return { success: true, data: null, error: null };
  }

  /** 修改自己的密码（仅本人） — [演示模式] 已禁用 */
  @Put(':id/password')
  async changePassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ChangePasswordDto,
    @CurrentUser('userId') userId: string,
  ) {
    // [演示模式] 禁止修改密码，防止演示时误操作导致锁死
    return {
      success: false,
      data: null,
      error: { code: 'FORBIDDEN', message: '演示模式：密码修改已禁用' },
    };
  }

  /** 管理员重置用户密码 — [演示模式] 已禁用 */
  @Put(':id/password/admin')
  @RequireGlobalRole('super_admin', 'admin')
  async adminResetPassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminResetPasswordDto,
    @CurrentUser('userId') operatorId: string,
  ) {
    // [演示模式] 禁止重置密码
    return {
      success: false,
      data: null,
      error: { code: 'FORBIDDEN', message: '演示模式：密码重置已禁用' },
    };
  }

  /** 软删除用户（仅 super_admin） */
  @Delete(':id')
  @RequireGlobalRole('super_admin')
  async softDelete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('userId') operatorId: string,
  ) {
    await this.usersService.softDelete(id, operatorId);
    return { success: true, data: null, error: null };
  }
}
