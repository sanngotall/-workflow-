import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ProjectEntity } from '../projects/project.entity';

/**
 * 微信小程序配置实体（per-project，一个项目对应一个小程序）
 *
 * 字段说明：
 * - app_id：微信小程序 AppID（明文，非敏感，用于日志和前端展示）
 * - encrypted_app_secret：AppSecret 密文（AES-256-GCM 加密，用于调微信 jscode2session）
 * - encrypted_jwt_secret：JWT 签名密钥密文（AES-256-GCM 加密，独立于系统 JWT_SECRET，
 *   专用于签发该项目的微信用户 token，实现多租户隔离）
 *
 * 安全约束（对齐 AGENTS.md Rule 3）：
 * - app_secret / jwt_secret 禁止明文落盘，必须通过 CryptoService 加密
 * - 响应接口只返回 app_id + has_secret 标志，不返回明文密钥
 */
@Entity('wx_configs')
@Index('idx_wxcfg_project', ['project_id'], { unique: true })
export class WxConfigEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'project_id' })
  project_id: string;

  @ManyToOne(() => ProjectEntity, (project) => project.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: ProjectEntity;

  @Column({ length: 64, name: 'app_id' })
  app_id: string;

  @Column({ type: 'text', name: 'encrypted_app_secret' })
  encrypted_app_secret: string;

  @Column({ type: 'text', name: 'encrypted_jwt_secret' })
  encrypted_jwt_secret: string;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updated_at: Date;
}
