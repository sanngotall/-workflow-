import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  ValueTransformer,
} from 'typeorm';
import { ProjectEntity } from '../projects/project.entity';
import { BusinessTableEntity } from '../business-data/business-table.entity';

/**
 * 文件索引元数据（对齐 SPEC-03 §5.1.1）
 *
 * 文件本体存本地磁盘，此表仅存索引。
 * business_tables 中 type=file 字段的物理列存 JSONB：{ fileId, fileName, mimeType, sizeBytes, sha256 }
 * 该 JSONB 中的 fileId 指向此表 id。
 */

// bigint 在 node-postgres 中默认返回字符串，统一转 number
const numericToNumber: ValueTransformer = {
  to: (value: number) => value,
  from: (value: string | number | null) =>
    value === null || value === undefined ? null : Number(value),
};

@Entity('file_index')
@Index('idx_fidx_project_table', ['project_id', 'business_table_id'])
@Index('idx_fidx_sha256', ['sha256'])
@Index('idx_fidx_expires', ['expires_at'])
export class FileIndexEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'project_id' })
  project_id: string;

  @ManyToOne(() => ProjectEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: ProjectEntity;

  @Column({ type: 'uuid', name: 'business_table_id' })
  business_table_id: string;

  @ManyToOne(() => BusinessTableEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'business_table_id' })
  business_table: BusinessTableEntity;

  @Column({ length: 255, name: 'file_name' })
  file_name: string; // 原始文件名

  @Column({ length: 100, name: 'mime_type' })
  mime_type: string; // 如 application/pdf

  @Column({ type: 'bigint', name: 'size_bytes', transformer: numericToNumber })
  size_bytes: number;

  @Column({ length: 64 })
  sha256: string; // 内容哈希

  @Column({ length: 500, name: 'storage_path' })
  storage_path: string; // 相对存储根目录

  @Column({ length: 20, name: 'storage_type', default: 'local_disk' })
  storage_type: 'local_disk' | 'minio';

  @Column({ type: 'timestamp with time zone', name: 'expires_at', nullable: true })
  expires_at: Date | null;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  created_at: Date;
}
