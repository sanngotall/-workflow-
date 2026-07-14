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
exports.ConfigSnapshotEntity = void 0;
const typeorm_1 = require("typeorm");
const project_entity_1 = require("../projects/project.entity");
let ConfigSnapshotEntity = class ConfigSnapshotEntity {
};
exports.ConfigSnapshotEntity = ConfigSnapshotEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ConfigSnapshotEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'project_id' }),
    __metadata("design:type", String)
], ConfigSnapshotEntity.prototype, "project_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.ProjectEntity, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'project_id' }),
    __metadata("design:type", project_entity_1.ProjectEntity)
], ConfigSnapshotEntity.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], ConfigSnapshotEntity.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', name: 'snapshot_json' }),
    __metadata("design:type", Object)
], ConfigSnapshotEntity.prototype, "snapshot_json", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'created_by', nullable: true }),
    __metadata("design:type", Object)
], ConfigSnapshotEntity.prototype, "created_by", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], ConfigSnapshotEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone', name: 'created_at' }),
    __metadata("design:type", Date)
], ConfigSnapshotEntity.prototype, "created_at", void 0);
exports.ConfigSnapshotEntity = ConfigSnapshotEntity = __decorate([
    (0, typeorm_1.Entity)('config_snapshots'),
    (0, typeorm_1.Unique)('UQ_project_version', ['project_id', 'version'])
], ConfigSnapshotEntity);
//# sourceMappingURL=config-snapshot.entity.js.map