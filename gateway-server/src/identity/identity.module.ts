import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { GlobalRoleEntity } from './global-role.entity';
import { ProjectMemberEntity } from './project-member.entity';
import { ConfigSnapshotEntity } from './config-snapshot.entity';
import { CredentialAuditLogEntity } from './credential-audit-log.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ProjectMembersService } from './project-members.service';
import { ProjectMembersController } from './project-members.controller';
import { GlobalRolesService } from './global-roles.service';
import { GlobalRolesController } from './global-roles.controller';
import {
  ConfigSnapshotsService,
  CredentialAuditLogsService,
} from './config-snapshots.service';
import {
  ConfigSnapshotsController,
  CredentialAuditLogsController,
} from './config-snapshots.controller';
import { BootstrapService } from './bootstrap.service';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '../config/config.module';

/**
 * 身份权限模块（对齐 SPEC-05）
 *
 * 装配内容：
 * - 5 个实体：UserEntity / GlobalRoleEntity / ProjectMemberEntity / ConfigSnapshotEntity / CredentialAuditLogEntity
 * - 5 个 Service：UsersService / ProjectMembersService / GlobalRolesService / ConfigSnapshotsService / CredentialAuditLogsService
 * - BootstrapService：启动时检测并创建初始 admin 账户（实现 OnModuleInit）
 * - 4 个 Controller：UsersController / ProjectMembersController / GlobalRolesController / ConfigSnapshotsController + CredentialAuditLogsController
 *
 * 依赖：AuthModule（提供 AuthService 用于密码哈希）
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      GlobalRoleEntity,
      ProjectMemberEntity,
      ConfigSnapshotEntity,
      CredentialAuditLogEntity,
    ]),
    AuthModule,
    ConfigModule,
  ],
  providers: [
    UsersService,
    ProjectMembersService,
    GlobalRolesService,
    ConfigSnapshotsService,
    CredentialAuditLogsService,
    BootstrapService,
  ],
  controllers: [
    UsersController,
    ProjectMembersController,
    GlobalRolesController,
    ConfigSnapshotsController,
    CredentialAuditLogsController,
  ],
  exports: [
    UsersService,
    ProjectMembersService,
    GlobalRolesService,
    ConfigSnapshotsService,
    CredentialAuditLogsService,
  ],
})
export class IdentityModule {}
