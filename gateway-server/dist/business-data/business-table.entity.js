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
exports.BusinessTableEntity = void 0;
const typeorm_1 = require("typeorm");
const project_entity_1 = require("../projects/project.entity");
const business_field_entity_1 = require("./business-field.entity");
const numericToNumber = {
    to: (value) => value,
    from: (value) => (value === null || value === undefined ? null : Number(value)),
};
let BusinessTableEntity = class BusinessTableEntity {
};
exports.BusinessTableEntity = BusinessTableEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BusinessTableEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'project_id' }),
    __metadata("design:type", String)
], BusinessTableEntity.prototype, "project_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.ProjectEntity, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'project_id' }),
    __metadata("design:type", project_entity_1.ProjectEntity)
], BusinessTableEntity.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, name: 'table_name' }),
    __metadata("design:type", String)
], BusinessTableEntity.prototype, "table_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, name: 'display_name' }),
    __metadata("design:type", String)
], BusinessTableEntity.prototype, "display_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, name: 'storage_type' }),
    __metadata("design:type", String)
], BusinessTableEntity.prototype, "storage_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', name: 'ttl_seconds', nullable: true }),
    __metadata("design:type", Object)
], BusinessTableEntity.prototype, "ttl_seconds", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20 }),
    __metadata("design:type", String)
], BusinessTableEntity.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', name: 'row_count', default: 0, transformer: numericToNumber }),
    __metadata("design:type", Number)
], BusinessTableEntity.prototype, "row_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 10, scale: 2, name: 'size_mb', default: 0, transformer: numericToNumber }),
    __metadata("design:type", Number)
], BusinessTableEntity.prototype, "size_mb", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone', name: 'created_at' }),
    __metadata("design:type", Date)
], BusinessTableEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp with time zone', name: 'updated_at' }),
    __metadata("design:type", Date)
], BusinessTableEntity.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => business_field_entity_1.BusinessFieldEntity, (field) => field.business_table, { cascade: true }),
    __metadata("design:type", Array)
], BusinessTableEntity.prototype, "fields", void 0);
exports.BusinessTableEntity = BusinessTableEntity = __decorate([
    (0, typeorm_1.Entity)('business_tables'),
    (0, typeorm_1.Unique)('UQ_biztbl_project_table', ['project_id', 'table_name']),
    (0, typeorm_1.Unique)('UQ_biztbl_table_name', ['table_name']),
    (0, typeorm_1.Index)('idx_biztbl_project', ['project_id'])
], BusinessTableEntity);
//# sourceMappingURL=business-table.entity.js.map