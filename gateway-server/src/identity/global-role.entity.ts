import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { UserEntity } from './user.entity';

/**
 * 全局角色表（对齐 SPEC-03 §3 #L151-#L158）
 * 跨项目的系统级角色，仅 super_admin / admin 两值
 */
@Entity('global_roles')
@Unique('UQ_user_role', ['user_id', 'role'])
export class GlobalRoleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  user_id: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity | null;

  @Column({ length: 20 })
  role: string; // super_admin, admin

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  created_at: Date;
}
