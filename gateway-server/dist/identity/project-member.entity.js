"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectMemberEntity = void 0;
const typeorm_1 = require("typeorm");
const project_entity_1 = require("../projects/project.entity");
const user_entity_1 = require("./user.entity");
let ProjectMemberEntity = class ProjectMemberEntity {
};
exports.ProjectMemberEntity = ProjectMemberEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ProjectMemberEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'project_id' }),
    __metadata("design:type", String)
], ProjectMemberEntity.prototype, "project_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.ProjectEntity, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'project_id' }),
    __metadata("design:type", Object)
], ProjectMemberEntity.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'user_id' }),
    __metadata("design:type", String)
], ProjectMemberEntity.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", Object)
], ProjectMemberEntity.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, default: 'developer' }),
    __metadata("design:type", String)
], ProjectMemberEntity.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone', name: 'joined_at', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], ProjectMemberEntity.prototype, "joined_at", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone', name: 'created_at' }),
    __metadata("design:type", Date)
], ProjectMemberEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp with time zone', name: 'updated_at' }),
    __metadata("design:type", Date)
], ProjectMemberEntity.prototype, "updated_at", void 0);
exports.ProjectMemberEntity = ProjectMemberEntity = __decorate([
    (0, typeorm_1.Entity)('project_members'),
    (0, typeorm_1.Unique)('UQ_project_user', ['project_id', 'user_id'])
], ProjectMemberEntity);
//# sourceMappingURL=project-member.entity.js.map