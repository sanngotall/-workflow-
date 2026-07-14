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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CredentialController = void 0;
const common_1 = require("@nestjs/common");
const credential_service_1 = require("./credential.service");
let CredentialController = class CredentialController {
    constructor(credentialService) {
        this.credentialService = credentialService;
    }
    async create(body) {
        const credential = await this.credentialService.create(body.project_id, body.name, body.type, body.secret);
        return {
            success: true,
            data: {
                id: credential.id,
                name: credential.name,
                type: credential.type,
                created_at: credential.created_at,
            },
            error: null,
        };
    }
    async findById(id) {
        const credential = await this.credentialService.findById(id);
        if (!credential) {
            return {
                success: false,
                data: null,
                error: {
                    code: 'CREDENTIAL_NOT_FOUND',
                    message: '凭证不存在',
                },
            };
        }
        return {
            success: true,
            data: {
                id: credential.id,
                name: credential.name,
                type: credential.type,
                created_at: credential.created_at,
            },
            error: null,
        };
    }
    async findByProjectId(projectId) {
        const credentials = await this.credentialService.findByProjectId(projectId);
        return {
            success: true,
            data: credentials.map((c) => ({
                id: c.id,
                name: c.name,
                type: c.type,
                created_at: c.created_at,
            })),
            error: null,
        };
    }
    async update(id, body) {
        const credential = await this.credentialService.update(id, body.name, body.type, body.secret);
        if (!credential) {
            return {
                success: false,
                data: null,
                error: {
                    code: 'CREDENTIAL_NOT_FOUND',
                    message: '凭证不存在',
                },
            };
        }
        return {
            success: true,
            data: {
                id: credential.id,
                name: credential.name,
                type: credential.type,
                created_at: credential.created_at,
            },
            error: null,
        };
    }
    async delete(id) {
        const success = await this.credentialService.delete(id);
        if (!success) {
            return {
                success: false,
                data: null,
                error: {
                    code: 'CREDENTIAL_NOT_FOUND',
                    message: '凭证不存在',
                },
            };
        }
        return {
            success: true,
            data: null,
            error: null,
        };
    }
};
exports.CredentialController = CredentialController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CredentialController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CredentialController.prototype, "findById", null);
__decorate([
    (0, common_1.Get)('project/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CredentialController.prototype, "findByProjectId", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CredentialController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CredentialController.prototype, "delete", null);
exports.CredentialController = CredentialController = __decorate([
    (0, common_1.Controller)('api/admin/v1/credentials'),
    __metadata("design:paramtypes", [credential_service_1.CredentialService])
], CredentialController);
//# sourceMappingURL=credential.controller.js.map