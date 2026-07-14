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
exports.TransformerController = void 0;
const common_1 = require("@nestjs/common");
const transformer_service_1 = require("./transformer.service");
let TransformerController = class TransformerController {
    constructor(transformerService) {
        this.transformerService = transformerService;
    }
    async create(body) {
        const transformer = await this.transformerService.create(body.route_id, body.target_url, body.type, body.credential_id, body.mapping_rules, body.script_code, body.response_rules);
        return {
            success: true,
            data: transformer,
            error: null,
        };
    }
    async findById(id) {
        const transformer = await this.transformerService.findById(id);
        if (!transformer) {
            return {
                success: false,
                data: null,
                error: {
                    code: 'TRANSFORMER_NOT_FOUND',
                    message: '转换器不存在',
                },
            };
        }
        return {
            success: true,
            data: transformer,
            error: null,
        };
    }
    async findByRouteId(routeId) {
        const transformer = await this.transformerService.findByRouteId(routeId);
        return {
            success: true,
            data: transformer,
            error: null,
        };
    }
    async update(id, body) {
        const transformer = await this.transformerService.update(id, body);
        if (!transformer) {
            return {
                success: false,
                data: null,
                error: {
                    code: 'TRANSFORMER_NOT_FOUND',
                    message: '转换器不存在',
                },
            };
        }
        return {
            success: true,
            data: transformer,
            error: null,
        };
    }
    async delete(id) {
        const success = await this.transformerService.delete(id);
        if (!success) {
            return {
                success: false,
                data: null,
                error: {
                    code: 'TRANSFORMER_NOT_FOUND',
                    message: '转换器不存在',
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
exports.TransformerController = TransformerController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TransformerController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransformerController.prototype, "findById", null);
__decorate([
    (0, common_1.Get)('route/:routeId'),
    __param(0, (0, common_1.Param)('routeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransformerController.prototype, "findByRouteId", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TransformerController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransformerController.prototype, "delete", null);
exports.TransformerController = TransformerController = __decorate([
    (0, common_1.Controller)('api/admin/v1/transformers'),
    __metadata("design:paramtypes", [transformer_service_1.TransformerService])
], TransformerController);
//# sourceMappingURL=transformer.controller.js.map