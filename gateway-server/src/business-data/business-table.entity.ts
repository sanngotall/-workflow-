import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Index, Unique, ValueTransformer } from 'typeorm';
import { ProjectEntity } from '../projects/project.entity';
import { BusinessFieldEntity } from './business-field.entity';

/**
 * 业务数据表元数据（对齐 SPEC-03 §5.1）
 *
 * 表隔离模式：所有项目共享同一个 PostgreSQL 实例，每项目独立一套业务表。
 * 物理表名 = {tablePrefix}_{slug}，tablePrefix 由 projectId 派生。
 * 业务表内严禁 project_id 字段。
 */

// node-postgres 默认把 bigint/numeric 作为字符串返回，这里统一转为 number
const numericToNumber: ValueTransformer = {
  to: (value: number) => value,
  from: (value: string | number | null) => (value === null || value === undefined ? null : Number(value)),
};

@Entity('business_tables')
@Unique('UQ_biztbl_project_table', ['project_id', 'table_name'])
@Unique('UQ_biztbl_table_name', ['table_name'])
@Index('idx_biztbl_project', ['project_id'])
export class BusinessTableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'project_id' })
  project_id: string;

  @ManyToOne(() => ProjectEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: ProjectEntity;

  @Column({ length: 100, name: 'table_name' })
  table_name: string; // 物理表名，如 proj001_chat_logs

  @Column({ length: 100, name: 'display_name' })
  display_name: string; // 用户可见名，如 "对话记录"

  @Column({ length: 20, name: 'storage_type' })
  storage_type: 'persistent' | 'cache';

  @Column({ type: 'int', name: 'ttl_seconds', nullable: true })
  ttl_seconds: number | null; // 仅 cache 类型有意义，最小 60

  @Column({ length: 20 })
  source: 'request' | 'response' | 'mixed';

  @Column({ type: 'bigint', name: 'row_count', default: 0, transformer: numericToNumber })
  row_count: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, name: 'size_mb', default: 0, transformer: numericToNumber })
  size_mb: number;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updated_at: Date;

  @OneToMany(() => BusinessFieldEntity, (field) => field.business_table, { cascade: true })
  fields: BusinessFieldEntity[];
}
