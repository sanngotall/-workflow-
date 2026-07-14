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
var ConfigSnapshotsService_1, CredentialAuditLogsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CredentialAuditLogsService = exports.ConfigSnapshotsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_snapshot_entity_1 = require("./config-snapshot.entity");
const credential_audit_log_entity_1 = require("./credential-audit-log.entity");
const ddt_exception_1 = require("../common/ddt-exception");
let ConfigSnapshotsService = ConfigSnapshotsService_1 = class ConfigSnapshotsService {
    constructor(snapshotRepo) {
        this.snapshotRepo = snapshotRepo;
        this.logger = new common_1.Logger(ConfigSnapshotsService_1.name);
    }
    async list(projectId) {
        const items = await this.snapshotRepo.find({
            where: { project_id: projectId },
            order: { created_at: 'DESC' },
        });
        return {
            items: items.map((s) => ({
                id: s.id,
                version: s.version,
                description: s.description ?? null,
                created_by: s.created_by ?? null,
                created_at: s.created_at,
            })),
            total: items.length,
        };
    }
    async create(projectId, version, description, snapshotJson, creatorId) {
        const snap = this.snapshotRepo.create({
            project_id: projectId,
            version,
            description: description ?? null,
            snapshot_json: snapshotJson,
            created_by: creatorId,
        });
        const saved = await this.snapshotRepo.save(snap);
        this.logger.log(`[Snapshots] 项目 ${projectId} 创建快照 v=${version}，操作者=${creatorId}`);
        return { id: saved.id, version: saved.version };
    }
    async findById(id) {
        const snap = await this.snapshotRepo.findOne({ where: { id } });
        if (!snap) {
            throw new ddt_exception_1.DdtException('PROJECT_NOT_FOUND', '配置快照不存在');
        }
        return snap;
    }
};
exports.ConfigSnapshotsService = ConfigSnapshotsService;
exports.ConfigSnapshotsService = ConfigSnapshotsService = ConfigSnapshotsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(config_snapshot_entity_1.ConfigSnapshotEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ConfigSnapshotsService);
let CredentialAuditLogsService = CredentialAuditLogsService_1 = class CredentialAuditLogsService {
    constructor(auditRepo) {
        this.auditRepo = auditRepo;
        this.logger = new common_1.Logger(CredentialAuditLogsService_1.name);
    }
    async record(params) {
        try {
            const log = this.auditRepo.create({
                credential_id: params.credential_id,
                user_id: params.user_id,
                action: params.action,
                client_ip: params.client_ip ?? null,
            });
            await this.auditRepo.save(log);
        }
        catch (err) {
            this.logger.error(`[Audit] 凭证审计日志写入失败 credential_id=${params.credential_id} action=${params.action}: ${err?.message}`);
        }
    }
    async list(params) {
        const page = Math.max(1, params.page || 1);
        const pageSize = Math.min(100, Math.max(1, params.pageSize || 20));
        const qb = this.auditRepo.createQueryBuilder('a');
        if (params.credential_id) {
            qb.andWhere('a.credential_id = :cid', { cid: params.credential_id });
        }
        if (params.user_id) {
            qb.andWhere('a.user_id = :uid', { uid: params.user_id });
        }
        if (params.action) {
            qb.andWhere('a.action = :action', { action: params.action });
        }
        qb.orderBy('a.created_at', 'DESC')
            .skip((page - 1) * pageSize)
            .take(pageSize);
        const [items, total] = await qb.getManyAndCount();
        return { items, total, page, pageSize };
    }
};
exports.CredentialAuditLogsService = CredentialAuditLogsService;
exports.CredentialAuditLogsService = CredentialAuditLogsService = CredentialAuditLogsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(credential_audit_log_entity_1.CredentialAuditLogEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CredentialAuditLogsService);
//# sourceMappingURL=config-snapshots.service.js.map