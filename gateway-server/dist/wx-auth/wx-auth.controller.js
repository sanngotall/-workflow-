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
var WxAuthController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WxAuthController = void 0;
const common_1 = require("@nestjs/common");
const wx_auth_service_1 = require("./wx-auth.service");
const decorators_1 = require("../common/decorators");
let WxAuthController = WxAuthController_1 = class WxAuthController {
    constructor(wxAuthService) {
        this.wxAuthService = wxAuthService;
        this.logger = new common_1.Logger(WxAuthController_1.name);
    }
    async login(transitId, body, reply) {
        if (!body?.wxCode) {
            reply.status(400).send({
                success: false,
                data: null,
                error: {
                    code: 'INVALID_ARGUMENT',
                    message: '缺少 wxCode 参数（wx.login() 返回的 5 分钟有效 code）',
                },
            });
            return;
        }
        try {
            const result = await this.wxAuthService.login(transitId, body.wxCode, body.userId);
            reply.send({
                success: true,
                data: result,
                error: null,
            });
        }
        catch (error) {
            if (error && typeof error.getResponse === 'function') {
                reply.send(error.getResponse());
            }
            else {
                this.logger.error(`[WxAuth] 未预期错误: ${error?.message || error}`);
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
exports.WxAuthController = WxAuthController;
__decorate([
    (0, common_1.Post)('auth/wx'),
    __param(0, (0, common_1.Param)('transitId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], WxAuthController.prototype, "login", null);
exports.WxAuthController = WxAuthController = WxAuthController_1 = __decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Controller)('v1/transit/:transitId'),
    __metadata("design:paramtypes", [wx_auth_service_1.WxAuthService])
], WxAuthController);
//# sourceMappingURL=wx-auth.controller.js.map