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
exports.CredentialAuditLogEntity = void 0;
const typeorm_1 = require("typeorm");
let CredentialAuditLogEntity = class CredentialAuditLogEntity {
};
exports.CredentialAuditLogEntity = CredentialAuditLogEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], CredentialAuditLogEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'credential_id', nullable: true }),
    __metadata("design:type", Object)
], CredentialAuditLogEntity.prototype, "credential_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'user_id', nullable: true }),
    __metadata("design:type", Object)
], CredentialAuditLogEntity.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 30 }),
    __metadata("design:type", String)
], CredentialAuditLogEntity.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true, name: 'client_ip' }),
    __metadata("design:type", Object)
], CredentialAuditLogEntity.prototype, "client_ip", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone', name: 'created_at' }),
    __metadata("design:type", Date)
], CredentialAuditLogEntity.prototype, "created_at", void 0);
exports.CredentialAuditLogEntity = CredentialAuditLogEntity = __decorate([
    (0, typeorm_1.Entity)('credential_audit_logs')
], CredentialAuditLogEntity);
//# sourceMappingURL=credential-audit-log.entity.js.map