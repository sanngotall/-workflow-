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
exports.WxConfigEntity = void 0;
const typeorm_1 = require("typeorm");
const project_entity_1 = require("../projects/project.entity");
let WxConfigEntity = class WxConfigEntity {
};
exports.WxConfigEntity = WxConfigEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], WxConfigEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'project_id' }),
    __metadata("design:type", String)
], WxConfigEntity.prototype, "project_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.ProjectEntity, (project) => project.id, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'project_id' }),
    __metadata("design:type", project_entity_1.ProjectEntity)
], WxConfigEntity.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64, name: 'app_id' }),
    __metadata("design:type", String)
], WxConfigEntity.prototype, "app_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', name: 'encrypted_app_secret' }),
    __metadata("design:type", String)
], WxConfigEntity.prototype, "encrypted_app_secret", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', name: 'encrypted_jwt_secret' }),
    __metadata("design:type", String)
], WxConfigEntity.prototype, "encrypted_jwt_secret", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone', name: 'created_at' }),
    __metadata("design:type", Date)
], WxConfigEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp with time zone', name: 'updated_at' }),
    __metadata("design:type", Date)
], WxConfigEntity.prototype, "updated_at", void 0);
exports.WxConfigEntity = WxConfigEntity = __decorate([
    (0, typeorm_1.Entity)('wx_configs'),
    (0, typeorm_1.Index)('idx_wxcfg_project', ['project_id'], { unique: true })
], WxConfigEntity);
//# sourceMappingURL=wx-config.entity.js.map