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
exports.TransformerEntity = void 0;
const typeorm_1 = require("typeorm");
const route_entity_1 = require("../routes/route.entity");
const credential_entity_1 = require("../credentials/credential.entity");
let TransformerEntity = class TransformerEntity {
};
exports.TransformerEntity = TransformerEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TransformerEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], TransformerEntity.prototype, "route_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => route_entity_1.RouteEntity, (route) => route.id, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'route_id' }),
    __metadata("design:type", route_entity_1.RouteEntity)
], TransformerEntity.prototype, "route", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], TransformerEntity.prototype, "credential_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => credential_entity_1.CredentialEntity, (credential) => credential.id, { onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'credential_id' }),
    __metadata("design:type", credential_entity_1.CredentialEntity)
], TransformerEntity.prototype, "credential", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], TransformerEntity.prototype, "target_url", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64 }),
    __metadata("design:type", String)
], TransformerEntity.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], TransformerEntity.prototype, "mapping_rules", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], TransformerEntity.prototype, "script_code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], TransformerEntity.prototype, "response_rules", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], TransformerEntity.prototype, "updated_at", void 0);
exports.TransformerEntity = TransformerEntity = __decorate([
    (0, typeorm_1.Entity)('transformers')
], TransformerEntity);
//# sourceMappingURL=transformer.entity.js.map