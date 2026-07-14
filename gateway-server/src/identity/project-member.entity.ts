import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { ProjectEntity } from '../projects/project.entity';
import { UserEntity } from './user.entity';

/**
 * 项目成员关联表（对齐 SPEC-03 §3 #L134-#L148）
 * 用户在某个项目下的成员身份与角色载体
 */
@Entity('project_members')
@Unique('UQ_project_user', ['project_id', 'user_id'])
export class ProjectMemberEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'project_id' })
  project_id: string;

  @ManyToOne(() => ProjectEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: ProjectEntity | null;

  @Column({ type: 'uuid', name: 'user_id' })
  user_id: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity | null;

  @Column({ length: 20, default: 'developer' })
  role: string; // admin/architect/developer/editor/ops/tester/operator/analyst/viewer

  @Column({ type: 'timestamp with time zone', name: 'joined_at', default: () => 'CURRENT_TIMESTAMP' })
  joined_at: Date;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updated_at: Date;
}
