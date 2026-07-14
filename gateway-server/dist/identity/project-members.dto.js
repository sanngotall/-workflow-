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
exports.SearchAvailableUsersDto = exports.UpdateMemberRoleDto = exports.AddMembersDto = exports.AddMemberItemDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class AddMemberItemDto {
}
exports.AddMemberItemDto = AddMemberItemDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AddMemberItemDto.prototype, "user_id", void 0);
__decorate([
    (0, class_validator_1.IsIn)([
        'admin',
        'architect',
        'developer',
        'editor',
        'ops',
        'tester',
        'operator',
        'analyst',
        'viewer',
    ]),
    __metadata("design:type", String)
], AddMemberItemDto.prototype, "role", void 0);
class AddMembersDto {
}
exports.AddMembersDto = AddMembersDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => AddMemberItemDto),
    __metadata("design:type", Array)
], AddMembersDto.prototype, "members", void 0);
class UpdateMemberRoleDto {
}
exports.UpdateMemberRoleDto = UpdateMemberRoleDto;
__decorate([
    (0, class_validator_1.IsIn)([
        'admin',
        'architect',
        'developer',
        'editor',
        'ops',
        'tester',
        'operator',
        'analyst',
        'viewer',
    ]),
    __metadata("design:type", String)
], UpdateMemberRoleDto.prototype, "role", void 0);
class SearchAvailableUsersDto {
}
exports.SearchAvailableUsersDto = SearchAvailableUsersDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SearchAvailableUsersDto.prototype, "keyword", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SearchAvailableUsersDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SearchAvailableUsersDto.prototype, "pageSize", void 0);
//# sourceMappingURL=project-members.dto.js.map