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
import { ProjectMembersService } from './project-members.service';
import {
  AddMembersDto,
  UpdateMemberRoleDto,
  SearchAvailableUsersDto,
} from './project-members.dto';
import { RequirePermission } from '../common/decorators';
import { CurrentUser } from '../common/current-user.decorator';

/**
 * 项目成员管理接口（对齐 SPEC-05 §6.3）
 *
 * 路由前缀 /api/projects/:projectId/members
 *
 * 权限规则：
 * - GET    /             → 项目任意成员（'member:list'）
 * - POST   /             → project admin 或 super_admin（'member:create'）
 * - PUT    /:memberId    → project admin 或 super_admin（'member:update'）
 * - DELETE /:memberId    → project admin 或 super_admin（'member:delete'）
 * - GET    /available    → project admin 或 super_admin（'member:create'）
 */
@Controller('projects/:projectId/members')
export class ProjectMembersController {
  constructor(private readonly membersService: ProjectMembersService) {}

  /** 获取成员列表 */
  @Get()
  @RequirePermission('member:list')
  async list(@Param('projectId', ParseUUIDPipe) projectId: string) {
    const data = await this.membersService.list(projectId);
    return { success: true, data, error: null };
  }

  /** 可添加用户列表（排除已加入成员） */
  @Get('available')
  @RequirePermission('member:create')
  async available(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query() dto: SearchAvailableUsersDto,
  ) {
    const data = await this.membersService.available(projectId, {
      keyword: dto.keyword,
      page: dto.page ? parseInt(dto.page, 10) : 1,
      pageSize: dto.pageSize ? parseInt(dto.pageSize, 10) : 20,
    });
    return { success: true, data, error: null };
  }

  /** 批量添加成员 */
  @Post()
  @RequirePermission('member:create')
  async add(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: AddMembersDto,
    @CurrentUser('userId') operatorId: string,
  ) {
    const data = await this.membersService.add(projectId, dto, operatorId);
    return { success: true, data, error: null };
  }

  /** 修改成员角色 */
  @Put(':memberId')
  @RequirePermission('member:update')
  async updateRole(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @Body() dto: UpdateMemberRoleDto,
    @CurrentUser('userId') operatorId: string,
  ) {
    await this.membersService.updateRole(projectId, memberId, dto, operatorId);
    return { success: true, data: null, error: null };
  }

  /** 移除成员 */
  @Delete(':memberId')
  @RequirePermission('member:delete')
  async remove(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @CurrentUser('userId') operatorId: string,
  ) {
    await this.membersService.remove(projectId, memberId, operatorId);
    return { success: true, data: null, error: null };
  }
}
