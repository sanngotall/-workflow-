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
var GatewayController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GatewayController = void 0;
const common_1 = require("@nestjs/common");
const gateway_service_1 = require("./gateway.service");
const decorators_1 = require("../common/decorators");
let GatewayController = GatewayController_1 = class GatewayController {
    constructor(gatewayService) {
        this.gatewayService = gatewayService;
        this.logger = new common_1.Logger(GatewayController_1.name);
    }
    async invoke(transitId, body, req, reply) {
        const clientIp = req.ip || req.headers['x-forwarded-for'] || 'unknown';
        try {
            const result = await this.gatewayService.handleRequest(transitId, body, clientIp, reply);
            if (result.streamed) {
                return;
            }
            reply.send({
                success: true,
                data: result.data,
                error: null,
            });
        }
        catch (error) {
            if (error && typeof error.getResponse === 'function') {
                reply.send(error.getResponse());
            }
            else {
                this.logger.error(`[Gateway] 未预期错误: ${error?.message || error}`);
                reply.send({
                    success: false,
                    data: null,
                    error: {
                        code: 'INTERNAL_ERROR',
                        message: error?.message || '内部错误',
                    },
                });
            }
        }
    }
};
exports.GatewayController = GatewayController;
__decorate([
    (0, common_1.Post)('invoke'),
    __param(0, (0, common_1.Param)('transitId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], GatewayController.prototype, "invoke", null);
exports.GatewayController = GatewayController = GatewayController_1 = __decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Controller)('v1/transit/:transitId'),
    __metadata("design:paramtypes", [gateway_service_1.GatewayService])
], GatewayController);
//# sourceMappingURL=gateway.controller.js.map