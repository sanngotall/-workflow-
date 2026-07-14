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
exports.BusinessFieldEntity = void 0;
const typeorm_1 = require("typeorm");
const business_table_entity_1 = require("./business-table.entity");
let BusinessFieldEntity = class BusinessFieldEntity {
};
exports.BusinessFieldEntity = BusinessFieldEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BusinessFieldEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'business_table_id' }),
    __metadata("design:type", String)
], BusinessFieldEntity.prototype, "business_table_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => business_table_entity_1.BusinessTableEntity, (table) => table.fields, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'business_table_id' }),
    __metadata("design:type", business_table_entity_1.BusinessTableEntity)
], BusinessFieldEntity.prototype, "business_table", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], BusinessFieldEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20 }),
    __metadata("design:type", String)
], BusinessFieldEntity.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20 }),
    __metadata("design:type", String)
], BusinessFieldEntity.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], BusinessFieldEntity.prototype, "enabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], BusinessFieldEntity.prototype, "nullable", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', name: 'is_primary_key', default: false }),
    __metadata("design:type", Boolean)
], BusinessFieldEntity.prototype, "is_primary_key", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], BusinessFieldEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], BusinessFieldEntity.prototype, "position", void 0);
exports.BusinessFieldEntity = BusinessFieldEntity = __decorate([
    (0, typeorm_1.Entity)('business_fields'),
    (0, typeorm_1.Unique)('UQ_bizfld_table_name', ['business_table_id', 'name']),
    (0, typeorm_1.Index)('idx_bizfld_table', ['business_table_id'])
], BusinessFieldEntity);
//# sourceMappingURL=business-field.entity.js.map