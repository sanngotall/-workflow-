"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var WxAuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WxAuthService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const jwt = __importStar(require("jsonwebtoken"));
const route_service_1 = require("../routes/route.service");
const wx_config_service_1 = require("../wx-config/wx-config.service");
const ddt_exception_1 = require("../common/ddt-exception");
let WxAuthService = WxAuthService_1 = class WxAuthService {
    constructor(routeService, wxConfigService) {
        this.routeService = routeService;
        this.wxConfigService = wxConfigService;
        this.logger = new common_1.Logger(WxAuthService_1.name);
        this.WX_JSCODE2SESSION_URL = 'https://api.weixin.qq.com/sns/jscode2session';
        this.WX_JWT_EXPIRES_IN = 7200;
    }
    async login(transitId, wxCode, userId) {
        const route = await this.routeService.findById(transitId);
        if (!route) {
            throw new ddt_exception_1.DdtException('ROUTE_NOT_FOUND');
        }
        const projectId = route.project_id;
        const secrets = await this.wxConfigService.getDecryptedSecrets(projectId);
        if (!secrets) {
            throw new ddt_exception_1.DdtException('INVALID_ARGUMENT', '该项目未配置微信小程序身份（app_id/app_secret/jwt_secret），请先在项目详情页"微信配置" tab 填写');
        }
        const { openid, sessionKey } = await this.callWxJscode2session(secrets.appId, secrets.appSecret, wxCode);
        const now = Math.floor(Date.now() / 1000);
        const payload = {
            openid,
            projectId,
            userId: userId || null,
            iat: now,
            exp: now + this.WX_JWT_EXPIRES_IN,
        };
        let token;
        try {
            token = jwt.sign(payload, secrets.jwtSecret, { algorithm: 'HS256' });
        }
        catch (err) {
            this.logger.error(`JWT 签发失败 project=${projectId}: ${err?.message || err}`);
            throw new ddt_exception_1.DdtException('INTERNAL_ERROR', 'JWT 签发失败');
        }
        this.logger.log(`微信登录成功 project=${projectId} transit=${transitId} openid=${openid.slice(0, 6)}***`);
        return {
            token,
            expiresIn: this.WX_JWT_EXPIRES_IN,
            openid,
        };
    }
    async callWxJscode2session(appId, appSecret, wxCode) {
        let response;
        try {
            response = await axios_1.default.get(this.WX_JSCODE2SESSION_URL, {
                params: {
                    appid: appId,
                    secret: appSecret,
                    js_code: wxCode,
                    grant_type: 'authorization_code',
                },
                timeout: 10000,
            });
        }
        catch (err) {
            this.logger.error(`调微信 jscode2session 网络失败: ${err?.message || err}`);
            throw new ddt_exception_1.DdtException('TARGET_SERVER_ERROR', '调微信接口网络失败');
        }
        const data = response.data;
        if (data.errcode && data.errcode !== 0) {
            this.logger.warn(`微信 jscode2session 返回错误 errcode=${data.errcode} errmsg=${data.errmsg}`);
            throw new ddt_exception_1.DdtException('INVALID_ARGUMENT', `微信登录失败：${data.errmsg || 'code 无效或已过期'}（errcode=${data.errcode}）`);
        }
        if (!data.openid || !data.session_key) {
            this.logger.warn(`微信 jscode2session 返回数据缺失 openid 或 session_key`);
            throw new ddt_exception_1.DdtException('INVALID_ARGUMENT', '微信登录返回数据异常，缺少 openid 或 session_key');
        }
        return {
            openid: data.openid,
            sessionKey: data.session_key,
        };
    }
};
exports.WxAuthService = WxAuthService;
exports.WxAuthService = WxAuthService = WxAuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [route_service_1.RouteService,
        wx_config_service_1.WxConfigService])
], WxAuthService);
//# sourceMappingURL=wx-auth.service.js.map