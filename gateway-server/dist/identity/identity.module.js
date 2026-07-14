"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("./user.entity");
const global_role_entity_1 = require("./global-role.entity");
const project_member_entity_1 = require("./project-member.entity");
const config_snapshot_entity_1 = require("./config-snapshot.entity");
const credential_audit_log_entity_1 = require("./credential-audit-log.entity");
const users_service_1 = require("./users.service");
const users_controller_1 = require("./users.controller");
const project_members_service_1 = require("./project-members.service");
const project_members_controller_1 = require("./project-members.controller");
const global_roles_service_1 = require("./global-roles.service");
const global_roles_controller_1 = require("./global-roles.controller");
const config_snapshots_service_1 = require("./config-snapshots.service");
const config_snapshots_controller_1 = require("./config-snapshots.controller");
const bootstrap_service_1 = require("./bootstrap.service");
const auth_module_1 = require("../auth/auth.module");
const config_module_1 = require("../config/config.module");
let IdentityModule = class IdentityModule {
};
exports.IdentityModule = IdentityModule;
exports.IdentityModule = IdentityModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                user_entity_1.UserEntity,
                global_role_entity_1.GlobalRoleEntity,
                project_member_entity_1.ProjectMemberEntity,
                config_snapshot_entity_1.ConfigSnapshotEntity,
                credential_audit_log_entity_1.CredentialAuditLogEntity,
            ]),
            auth_module_1.AuthModule,
            config_module_1.ConfigModule,
        ],
        providers: [
            users_service_1.UsersService,
            project_members_service_1.ProjectMembersService,
            global_roles_service_1.GlobalRolesService,
            config_snapshots_service_1.ConfigSnapshotsService,
            config_snapshots_service_1.CredentialAuditLogsService,
            bootstrap_service_1.BootstrapService,
        ],
        controllers: [
            users_controller_1.UsersController,
            project_members_controller_1.ProjectMembersController,
            global_roles_controller_1.GlobalRolesController,
            config_snapshots_controller_1.ConfigSnapshotsController,
            config_snapshots_controller_1.CredentialAuditLogsController,
        ],
        exports: [
            users_service_1.UsersService,
            project_members_service_1.ProjectMembersService,
            global_roles_service_1.GlobalRolesService,
            config_snapshots_service_1.ConfigSnapshotsService,
            config_snapshots_service_1.CredentialAuditLogsService,
        ],
    })
], IdentityModule);
//# sourceMappingURL=identity.module.js.map