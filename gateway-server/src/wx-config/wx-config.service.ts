import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WxConfigEntity } from './wx-config.entity';
import { CryptoService } from '../crypto/crypto.service';

/**
 * 微信小程序配置服务
 *
 * 职责：
 * 1. 按 projectId 获取/保存/删除微信配置（upsert 语义）
 * 2. app_secret / jwt_secret 通过 CryptoService 加密存储，禁止明文落盘
 * 3. getDecryptedSecrets 仅供网关内部调用 jscode2session 和签发 JWT 时使用
 *
 * 安全约束（对齐 AGENTS.md Rule 3）：
 * - 所有写操作必须经过 CryptoService.encrypt
 * - 对外响应只返回 app_id + has_secret 标志，不返回明文密钥
 */
@Injectable()
export class WxConfigService {
  constructor(
    @InjectRepository(WxConfigEntity)
    private readonly wxConfigRepository: Repository<WxConfigEntity>,
    private readonly cryptoService: CryptoService,
  ) {}

  /** 按 projectId 获取配置（含密文） */
  async findByProjectId(projectId: string): Promise<WxConfigEntity | null> {
    return this.wxConfigRepository.findOne({ where: { project_id: projectId } });
  }

  /**
   * 获取解密后的 app_secret 和 jwt_secret（仅供网关内部调用）
   * 配置不存在时返回 null
   */
  async getDecryptedSecrets(
    projectId: string,
  ): Promise<{ appId: string; appSecret: string; jwtSecret: string } | null> {
    const config = await this.findByProjectId(projectId);
    if (!config) return null;
    return {
      appId: config.app_id,
      appSecret: this.cryptoService.decrypt(config.encrypted_app_secret),
      jwtSecret: this.cryptoService.decrypt(config.encrypted_jwt_secret),
    };
  }

  /**
   * 创建或更新微信配置（upsert 语义）
   * - 配置不存在：创建新记录
   * - 配置已存在：更新 app_id + app_secret + jwt_secret
   */
  async upsert(
    projectId: string,
    appId: string,
    appSecret: string,
    jwtSecret: string,
  ): Promise<WxConfigEntity> {
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

  /** 删除配置（项目删除时由 CASCADE 自动清理，也可手动调用） */
  async deleteByProjectId(projectId: string): Promise<boolean> {
    const result = await this.wxConfigRepository.delete({ project_id: projectId });
    return (result.affected ?? 0) > 0;
  }
}
