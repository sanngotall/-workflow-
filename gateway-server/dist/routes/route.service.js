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
exports.RouteService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const route_entity_1 = require("./route.entity");
const redis_service_1 = require("../redis/redis.service");
let RouteService = class RouteService {
    constructor(routeRepository, redisService) {
        this.routeRepository = routeRepository;
        this.redisService = redisService;
    }
    async create(projectId, environment, method, path, isAsync = false, timeoutMs = 15000, isMock = false, mockResponse = null) {
        const route = this.routeRepository.create({
            project_id: projectId,
            environment,
            method: method.toUpperCase(),
            path,
            is_async: isAsync,
            timeout_ms: timeoutMs,
            is_mock: isMock,
            mock_response: mockResponse,
            is_active: true,
        });
        return this.routeRepository.save(route);
    }
    async findById(id) {
        return this.routeRepository.findOne({ where: { id } });
    }
    async findByMatch(projectId, environment, method, path) {
        return this.routeRepository.findOne({
            where: {
                project_id: projectId,
                environment,
                method: method.toUpperCase(),
                path,
                is_active: true,
            },
        });
    }
    async findByProjectId(projectId) {
        return this.routeRepository.find({ where: { project_id: projectId } });
    }
    async update(id, updates) {
        const route = await this.findById(id);
        if (!route)
            return null;
        Object.assign(route, updates);
        return this.routeRepository.save(route);
    }
    async delete(id) {
        const result = await this.routeRepository.delete(id);
        return result.affected !== undefined && result.affected !== null && result.affected > 0;
    }
    async cacheRoute(routeId, data) {
        const key = await this.redisService.getTransitRouteKey(routeId);
        await this.redisService.jsonSet(key, data);
    }
    async getCachedRoute(transitId) {
        const key = await this.redisService.getTransitRouteKey(transitId);
        return this.redisService.jsonGet(key);
    }
    async clearCache(transitId) {
        const key = await this.redisService.getTransitRouteKey(transitId);
        await this.redisService.del(key);
    }
    async broadcastConfigReload(routeId) {
        await this.redisService.publish('ddt:channel:config_reload', JSON.stringify({ routeId }));
    }
};
exports.RouteService = RouteService;
exports.RouteService = RouteService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(route_entity_1.RouteEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        redis_service_1.RedisService])
], RouteService);
//# sourceMappingURL=route.service.js.map