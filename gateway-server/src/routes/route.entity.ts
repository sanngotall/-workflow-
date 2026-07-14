import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ProjectEntity } from '../projects/project.entity';

@Entity('routes')
export class RouteEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  project_id: string;

  @ManyToOne(() => ProjectEntity, (project) => project.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: ProjectEntity;

  @Column({ length: 20, default: 'prod' })
  environment: string;

  @Column({ length: 10 })
  method: string;

  @Column({ length: 255 })
  path: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'boolean', default: false })
  is_async: boolean;

  /**
   * Mock 模式开关（对齐 SPEC-00 IN-SCOPE 第 6 项 [Mock-Mode]）
   * true 时网关层阻断向下游派发，直接返回 mock_response（静态 JSON）
   */
  @Column({ type: 'boolean', default: false })
  is_mock: boolean;

  /**
   * Mock 静态响应体（JSONB）
   * is_mock=true 时网关层直接 JSON.parse 后返回，不走 transformer/credential/dispatch
   */
  @Column({ type: 'jsonb', nullable: true })
  mock_response: Record<string, any> | null;

  @Column({ type: 'integer', default: 15000 })
  timeout_ms: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
