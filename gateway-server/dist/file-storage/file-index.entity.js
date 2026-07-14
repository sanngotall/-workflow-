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
exports.FileIndexEntity = void 0;
const typeorm_1 = require("typeorm");
const project_entity_1 = require("../projects/project.entity");
const business_table_entity_1 = require("../business-data/business-table.entity");
const numericToNumber = {
    to: (value) => value,
    from: (value) => value === null || value === undefined ? null : Number(value),
};
let FileIndexEntity = class FileIndexEntity {
};
exports.FileIndexEntity = FileIndexEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], FileIndexEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'project_id' }),
    __metadata("design:type", String)
], FileIndexEntity.prototype, "project_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.ProjectEntity, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'project_id' }),
    __metadata("design:type", project_entity_1.ProjectEntity)
], FileIndexEntity.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'business_table_id' }),
    __metadata("design:type", String)
], FileIndexEntity.prototype, "business_table_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => business_table_entity_1.BusinessTableEntity, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'business_table_id' }),
    __metadata("design:type", business_table_entity_1.BusinessTableEntity)
], FileIndexEntity.prototype, "business_table", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, name: 'file_name' }),
    __metadata("design:type", String)
], FileIndexEntity.prototype, "file_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, name: 'mime_type' }),
    __metadata("design:type", String)
], FileIndexEntity.prototype, "mime_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', name: 'size_bytes', transformer: numericToNumber }),
    __metadata("design:type", Number)
], FileIndexEntity.prototype, "size_bytes", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64 }),
    __metadata("design:type", String)
], FileIndexEntity.prototype, "sha256", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500, name: 'storage_path' }),
    __metadata("design:type", String)
], FileIndexEntity.prototype, "storage_path", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, name: 'storage_type', default: 'local_disk' }),
    __metadata("design:type", String)
], FileIndexEntity.prototype, "storage_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone', name: 'expires_at', nullable: true }),
    __metadata("design:type", Object)
], FileIndexEntity.prototype, "expires_at", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone', name: 'created_at' }),
    __metadata("design:type", Date)
], FileIndexEntity.prototype, "created_at", void 0);
exports.FileIndexEntity = FileIndexEntity = __decorate([
    (0, typeorm_1.Entity)('file_index'),
    (0, typeorm_1.Index)('idx_fidx_project_table', ['project_id', 'business_table_id']),
    (0, typeorm_1.Index)('idx_fidx_sha256', ['sha256']),
    (0, typeorm_1.Index)('idx_fidx_expires', ['expires_at'])
], FileIndexEntity);
//# sourceMappingURL=file-index.entity.js.map