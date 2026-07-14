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
exports.RequestLogService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const request_log_entity_1 = require("./request-log.entity");
let RequestLogService = class RequestLogService {
    constructor(requestLogRepository) {
        this.requestLogRepository = requestLogRepository;
    }
    async create(dto) {
        const log = this.requestLogRepository.create(dto);
        return this.requestLogRepository.save(log);
    }
    async findByProjectId(projectId, limit = 100) {
        return this.requestLogRepository.find({
            where: { project_id: projectId },
            order: { created_at: 'DESC' },
            take: limit,
        });
    }
    async findByRouteId(routeId, limit = 100) {
        return this.requestLogRepository.find({
            where: { route_id: routeId },
            order: { created_at: 'DESC' },
            take: limit,
        });
    }
    async listLogs(options) {
        const limit = Math.min(options.limit ?? 50, 500);
        const offset = options.offset ?? 0;
        const qb = this.requestLogRepository
            .createQueryBuilder('log')
            .where('log.project_id = :projectId', { projectId: options.projectId });
        if (options.routeId) {
            qb.andWhere('log.route_id = :routeId', { routeId: options.routeId });
        }
        if (options.method) {
            qb.andWhere('log.method = :method', { method: options.method.toUpperCase() });
        }
        if (options.httpStatus) {
            qb.andWhere('log.http_status = :httpStatus', { httpStatus: options.httpStatus });
        }
        if (options.errorCode) {
            qb.andWhere('log.error_code = :errorCode', { errorCode: options.errorCode });
        }
        qb.orderBy('log.created_at', 'DESC')
            .take(limit)
            .skip(offset);
        const [rows, total] = await qb.getManyAndCount();
        return { rows, total };
    }
    async getStats(projectId, sinceHours = 24) {
        const since = new Date(Date.now() - sinceHours * 60 * 60 * 1000);
        const baseStats = await this.requestLogRepository
            .createQueryBuilder('log')
            .select('COUNT(*)', 'total')
            .addSelect(`SUM(CASE WHEN log.http_status >= 400 THEN 1 ELSE 0 END)`, 'error_count')
            .addSelect('COALESCE(AVG(log.latency_ms), 0)', 'avg_latency_ms')
            .where('log.project_id = :projectId', { projectId })
            .andWhere('log.created_at >= :since', { since })
            .getRawOne();
        const p95Result = await this.requestLogRepository
            .createQueryBuilder('log')
            .select('COALESCE(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY log.latency_ms), 0)', 'p95')
            .where('log.project_id = :projectId', { projectId })
            .andWhere('log.created_at >= :since', { since })
            .getRawOne();
        const statusDist = await this.requestLogRepository
            .createQueryBuilder('log')
            .select('log.http_status', 'status')
            .addSelect('COUNT(*)', 'count')
            .where('log.project_id = :projectId', { projectId })
            .andWhere('log.created_at >= :since', { since })
            .groupBy('log.http_status')
            .getRawMany();
        const status_distribution = {};
        for (const row of statusDist) {
            status_distribution[String(row.status)] = parseInt(row.count, 10);
        }
        const topErrors = await this.requestLogRepository
            .createQueryBuilder('log')
            .select('log.error_code', 'error_code')
            .addSelect('COUNT(*)', 'count')
            .where('log.project_id = :projectId', { projectId })
            .andWhere('log.created_at >= :since', { since })
            .andWhere('log.error_code IS NOT NULL')
            .groupBy('log.error_code')
            .orderBy('count', 'DESC')
            .limit(5)
            .getRawMany();
        return {
            total: parseInt(baseStats?.total || '0', 10),
            error_count: parseInt(baseStats?.error_count || '0', 10),
            avg_latency_ms: Math.round(parseFloat(baseStats?.avg_latency_ms || '0')),
            p95_latency_ms: Math.round(parseFloat(p95Result?.p95 || '0')),
            status_distribution,
            top_errors: topErrors.map((e) => ({
                error_code: e.error_code,
                count: parseInt(e.count, 10),
            })),
        };
    }
};
exports.RequestLogService = RequestLogService;
exports.RequestLogService = RequestLogService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(request_log_entity_1.RequestLogEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], RequestLogService);
//# sourceMappingURL=request-log.service.js.map