"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CredentialsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const credential_entity_1 = require("./credential.entity");
const credential_service_1 = require("./credential.service");
const credential_controller_1 = require("./credential.controller");
const crypto_module_1 = require("../crypto/crypto.module");
let CredentialsModule = class CredentialsModule {
};
exports.CredentialsModule = CredentialsModule;
exports.CredentialsModule = CredentialsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([credential_entity_1.CredentialEntity]), crypto_module_1.CryptoModule],
        providers: [credential_service_1.CredentialService],
        controllers: [credential_controller_1.CredentialController],
        exports: [credential_service_1.CredentialService],
    })
], CredentialsModule);
//# sourceMappingURL=credentials.module.js.map