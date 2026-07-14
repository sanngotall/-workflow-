import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Unique, Index } from 'typeorm';
import { BusinessTableEntity } from './business-table.entity';

/**
 * 业务表字段元数据（对齐 SPEC-03 §5.1）
 * 每个字段一行；enabled=false 时不在物理表中创建列
 */
@Entity('business_fields')
@Unique('UQ_bizfld_table_name', ['business_table_id', 'name'])
@Index('idx_bizfld_table', ['business_table_id'])
export class BusinessFieldEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'business_table_id' })
  business_table_id: string;

  @ManyToOne(() => BusinessTableEntity, (table) => table.fields, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'business_table_id' })
  business_table: BusinessTableEntity;

  @Column({ length: 100 })
  name: string; // 字段名（物理列名）

  @Column({ length: 20 })
  type: 'string' | 'number' | 'boolean' | 'json' | 'timestamp' | 'file';

  @Column({ length: 20 })
  source: 'request' | 'response' | 'system';

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @Column({ type: 'boolean', default: true })
  nullable: boolean;

  @Column({ type: 'boolean', name: 'is_primary_key', default: false })
  is_primary_key: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', default: 0 })
  position: number; // 列顺序
}
