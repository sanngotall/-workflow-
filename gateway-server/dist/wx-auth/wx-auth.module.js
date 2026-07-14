"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WxAuthModule = void 0;
const common_1 = require("@nestjs/common");
const wx_auth_controller_1 = require("./wx-auth.controller");
const wx_auth_service_1 = require("./wx-auth.service");
const routes_module_1 = require("../routes/routes.module");
const wx_config_module_1 = require("../wx-config/wx-config.module");
let WxAuthModule = class WxAuthModule {
};
exports.WxAuthModule = WxAuthModule;
exports.WxAuthModule = WxAuthModule = __decorate([
    (0, common_1.Module)({
        imports: [routes_module_1.RoutesModule, wx_config_module_1.WxConfigModule],
        controllers: [wx_auth_controller_1.WxAuthController],
        providers: [wx_auth_service_1.WxAuthService],
    })
], WxAuthModule);
//# sourceMappingURL=wx-auth.module.js.map