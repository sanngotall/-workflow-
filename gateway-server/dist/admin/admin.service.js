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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const route_service_1 = require("../routes/route.service");
const transformer_service_1 = require("../transformers/transformer.service");
const credential_service_1 = require("../credentials/credential.service");
const redis_service_1 = require("../redis/redis.service");
let AdminService = class AdminService {
    constructor(routeService, transformerService, credentialService, redisService) {
        this.routeService = routeService;
        this.transformerService = transformerService;
        this.credentialService = credentialService;
        this.redisService = redisService;
    }
    async createRouteWithTransformer(dto) {
        const route = await this.routeService.create(dto.project_id, dto.environment, dto.method, dto.path, dto.is_async, dto.timeout_ms, dto.is_mock, dto.mock_response);
        await this.transformerService.create(route.id, dto.transformer.target_url, dto.transformer.type, dto.transformer.credential_id, dto.transformer.mapping_rules, dto.transformer.script_code, dto.transformer.response_rules);
        await this.updateRouteCache(route.id);
        await this.routeService.broadcastConfigReload(route.id);
        return {
            route_id: route.id,
            status: 'ACTIVE',
        };
    }
    async updateRouteCache(routeId) {
        const route = await this.routeService.findById(routeId);
        if (!route)
            return;
        const transformer = await this.transformerService.findByRouteId(routeId);
        let credentialInfo = null;
        if (transformer?.credential_id) {
            const credential = await this.credentialService.findById(transformer.credential_id);
            if (credential) {
                const secret = await this.credentialService.getDecryptedSecret(credential.id);
                credentialInfo = {
                    type: credential.type,
                    secret,
                };
            }
        }
        const cacheData = {
            route,
            transformer,
            credential: credentialInfo,
        };
        await this.routeService.cacheRoute(routeId, cacheData);
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [route_service_1.RouteService,
        transformer_service_1.TransformerService,
        credential_service_1.CredentialService,
        redis_service_1.RedisService])
], AdminService);
//# sourceMappingURL=admin.service.js.map