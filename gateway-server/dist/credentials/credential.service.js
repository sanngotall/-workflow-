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
exports.CredentialService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const credential_entity_1 = require("./credential.entity");
const crypto_service_1 = require("../crypto/crypto.service");
let CredentialService = class CredentialService {
    constructor(credentialRepository, cryptoService) {
        this.credentialRepository = credentialRepository;
        this.cryptoService = cryptoService;
    }
    async create(projectId, name, type, secret) {
        const encryptedSecret = this.cryptoService.encrypt(secret);
        const credential = this.credentialRepository.create({
            project_id: projectId,
            name,
            type,
            encrypted_secret: encryptedSecret,
        });
        return this.credentialRepository.save(credential);
    }
    async findById(id) {
        return this.credentialRepository.findOne({ where: { id } });
    }
    async findByProjectId(projectId) {
        return this.credentialRepository.find({ where: { project_id: projectId } });
    }
    async getDecryptedSecret(id) {
        const credential = await this.findById(id);
        if (!credential)
            return null;
        return this.cryptoService.decrypt(credential.encrypted_secret);
    }
    async update(id, name, type, secret) {
        const credential = await this.findById(id);
        if (!credential)
            return null;
        if (name !== undefined)
            credential.name = name;
        if (type !== undefined)
            credential.type = type;
        if (secret !== undefined)
            credential.encrypted_secret = this.cryptoService.encrypt(secret);
        return this.credentialRepository.save(credential);
    }
    async delete(id) {
        const result = await this.credentialRepository.delete(id);
        return result.affected !== undefined && result.affected !== null && result.affected > 0;
    }
};
exports.CredentialService = CredentialService;
exports.CredentialService = CredentialService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(credential_entity_1.CredentialEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        crypto_service_1.CryptoService])
], CredentialService);
//# sourceMappingURL=credential.service.js.map