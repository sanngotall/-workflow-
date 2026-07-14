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
exports.BackupTableDto = exports.UpdateBusinessTableDto = exports.CreateBusinessTableDto = exports.CreateBusinessFieldDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateBusinessFieldDto {
}
exports.CreateBusinessFieldDto = CreateBusinessFieldDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBusinessFieldDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBusinessFieldDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['string', 'number', 'boolean', 'json', 'timestamp', 'file']),
    __metadata("design:type", String)
], CreateBusinessFieldDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['request', 'response', 'system']),
    __metadata("design:type", String)
], CreateBusinessFieldDto.prototype, "source", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateBusinessFieldDto.prototype, "enabled", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateBusinessFieldDto.prototype, "nullable", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateBusinessFieldDto.prototype, "is_primary_key", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBusinessFieldDto.prototype, "description", void 0);
class CreateBusinessTableDto {
}
exports.CreateBusinessTableDto = CreateBusinessTableDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBusinessTableDto.prototype, "display_name", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['persistent', 'cache']),
    __metadata("design:type", String)
], CreateBusinessTableDto.prototype, "storage_type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(60),
    __metadata("design:type", Object)
], CreateBusinessTableDto.prototype, "ttl_seconds", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['request', 'response', 'mixed']),
    __metadata("design:type", String)
], CreateBusinessTableDto.prototype, "source", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateBusinessFieldDto),
    __metadata("design:type", Array)
], CreateBusinessTableDto.prototype, "fields", void 0);
class UpdateBusinessTableDto {
}
exports.UpdateBusinessTableDto = UpdateBusinessTableDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBusinessTableDto.prototype, "display_name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['persistent', 'cache']),
    __metadata("design:type", String)
], UpdateBusinessTableDto.prototype, "storage_type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(60),
    __metadata("design:type", Object)
], UpdateBusinessTableDto.prototype, "ttl_seconds", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['request', 'response', 'mixed']),
    __metadata("design:type", String)
], UpdateBusinessTableDto.prototype, "source", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateBusinessFieldDto),
    __metadata("design:type", Array)
], UpdateBusinessTableDto.prototype, "fields", void 0);
class BackupTableDto {
}
exports.BackupTableDto = BackupTableDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], BackupTableDto.prototype, "gzip", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BackupTableDto.prototype, "description", void 0);
//# sourceMappingURL=dto.js.map