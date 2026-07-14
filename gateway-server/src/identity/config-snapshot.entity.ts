import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { ProjectEntity } from '../projects/project.entity';

/**
 * 配置快照表（对齐 SPEC-03 §3 #L173-#L183）
 * 支持 SPEC-00 IN-SCOPE 第 7 项 [Config-Ops] 配置版本控制
 */
@Entity('config_snapshots')
@Unique('UQ_project_version', ['project_id', 'version'])
export class ConfigSnapshotEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'project_id' })
  project_id: string;

  @ManyToOne(() => ProjectEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: ProjectEntity;

  @Column({ length: 50 })
  version: string; // 语义化版本号, 如 v1.0.0

  @Column({ type: 'jsonb', name: 'snapshot_json' })
  snapshot_json: Record<string, any>; // 全量路由+转换器+凭证引用的导出快照

  @Column({ type: 'uuid', name: 'created_by', nullable: true })
  created_by: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  created_at: Date;
}
