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
exports.WxConfigService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const wx_config_entity_1 = require("./wx-config.entity");
const crypto_service_1 = require("../crypto/crypto.service");
let WxConfigService = class WxConfigService {
    constructor(wxConfigRepository, cryptoService) {
        this.wxConfigRepository = wxConfigRepository;
        this.cryptoService = cryptoService;
    }
    async findByProjectId(projectId) {
        return this.wxConfigRepository.findOne({ where: { project_id: projectId } });
    }
    async getDecryptedSecrets(projectId) {
        const config = await this.findByProjectId(projectId);
        if (!config)
            return null;
        return {
            appId: config.app_id,
            appSecret: this.cryptoService.decrypt(config.encrypted_app_secret),
            jwtSecret: this.cryptoService.decrypt(config.encrypted_jwt_secret),
        };
    }
    async upsert(projectId, appId, appSecret, jwtSecret) {
        const existing = await this.findByProjectId(projectId);
        if (existing) {
            existing.app_id = appId;
            existing.encrypted_app_secret = this.cryptoService.encrypt(appSecret);
            existing.encrypted_jwt_secret = this.cryptoService.encrypt(jwtSecret);
            return this.wxConfigRepository.save(existing);
        }
        const config = this.wxConfigRepository.create({
            project_id: projectId,
            app_id: appId,
            encrypted_app_secret: this.cryptoService.encrypt(appSecret),
            encrypted_jwt_secret: this.cryptoService.encrypt(jwtSecret),
        });
        return this.wxConfigRepository.save(config);
    }
    async deleteByProjectId(projectId) {
        const result = await this.wxConfigRepository.delete({ project_id: projectId });
        return (result.affected ?? 0) > 0;
    }
};
exports.WxConfigService = WxConfigService;
exports.WxConfigService = WxConfigService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(wx_config_entity_1.WxConfigEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        crypto_service_1.CryptoService])
], WxConfigService);
//# sourceMappingURL=wx-config.service.js.map