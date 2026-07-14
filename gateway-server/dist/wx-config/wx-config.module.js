"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WxConfigModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const wx_config_entity_1 = require("./wx-config.entity");
const wx_config_service_1 = require("./wx-config.service");
const wx_config_controller_1 = require("./wx-config.controller");
const crypto_module_1 = require("../crypto/crypto.module");
let WxConfigModule = class WxConfigModule {
};
exports.WxConfigModule = WxConfigModule;
exports.WxConfigModule = WxConfigModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([wx_config_entity_1.WxConfigEntity]), crypto_module_1.CryptoModule],
        controllers: [wx_config_controller_1.WxConfigController],
        providers: [wx_config_service_1.WxConfigService],
        exports: [wx_config_service_1.WxConfigService],
    })
], WxConfigModule);
//# sourceMappingURL=wx-config.module.js.map