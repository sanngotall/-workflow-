import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigSnapshotEntity } from './config-snapshot.entity';
import { CredentialAuditLogEntity } from './credential-audit-log.entity';
import { DdtException } from '../common/ddt-exception';

/**
 * 配置快照与凭证审计服务（对齐 SPEC-05 §3.1 / SPEC-00 IN-SCOPE 第 7 项）
 *
 * 当前为最小实现：
 * - ConfigSnapshot：导出当前项目路由+转换器+凭证引用为 JSONB 快照，支持回滚
 * - CredentialAuditLog：记录凭证解密访问，供审计查询
 */
@Injectable()
export class ConfigSnapshotsService {
  private readonly logger = new Logger(ConfigSnapshotsService.name);

  constructor(
    @InjectRepository(ConfigSnapshotEntity)
    private readonly snapshotRepo: Repository<ConfigSnapshotEntity>,
  ) {}

  /** 列出项目的配置快照 */
  async list(projectId: string): Promise<{
    items: Array<{
      id: string;
      version: string;
      description: string | null;
      created_by: string | null;
      created_at: Date;
    }>;
    total: number;
  }> {
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

  /** 创建配置快照（导出当前配置） */
  async create(
    projectId: string,
    version: string,
    description: string | null,
    snapshotJson: Record<string, any>,
    creatorId: string,
  ): Promise<{ id: string; version: string }> {
    const snap = this.snapshotRepo.create({
      project_id: projectId,
      version,
      description: description ?? null,
      snapshot_json: snapshotJson,
      created_by: creatorId,
    });
    const saved = await this.snapshotRepo.save(snap);
    this.logger.log(
      `[Snapshots] 项目 ${projectId} 创建快照 v=${version}，操作者=${creatorId}`,
    );
    return { id: saved.id, version: saved.version };
  }

  /** 获取快照详情（用于回滚） */
  async findById(id: string): Promise<ConfigSnapshotEntity> {
    const snap = await this.snapshotRepo.findOne({ where: { id } });
    if (!snap) {
      throw new DdtException('PROJECT_NOT_FOUND', '配置快照不存在');
    }
    return snap;
  }
}

/**
 * 凭证审计日志服务（对齐 SPEC-05 §8）
 */
@Injectable()
export class CredentialAuditLogsService {
  private readonly logger = new Logger(CredentialAuditLogsService.name);

  constructor(
    @InjectRepository(CredentialAuditLogEntity)
    private readonly auditRepo: Repository<CredentialAuditLogEntity>,
  ) {}

  /** 记录一条凭证审计日志（异步写入，不阻塞主流程） */
  async record(params: {
    credential_id: string | null;
    user_id: string | null;
    action: 'create' | 'view' | 'update' | 'delete' | 'decrypt';
    client_ip?: string | null;
  }): Promise<void> {
    try {
      const log = this.auditRepo.create({
        credential_id: params.credential_id,
        user_id: params.user_id,
        action: params.action,
        client_ip: params.client_ip ?? null,
      });
      await this.auditRepo.save(log);
    } catch (err: any) {
      // 审计日志写入失败不阻塞主流程，仅记录错误
      this.logger.error(
        `[Audit] 凭证审计日志写入失败 credential_id=${params.credential_id} action=${params.action}: ${err?.message}`,
      );
    }
  }

  /** 查询凭证审计日志列表 */
  async list(params: {
    credential_id?: string;
    user_id?: string;
    action?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{
    items: CredentialAuditLogEntity[];
    total: number;
    page: number;
    pageSize: number;
  }> {
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
}
