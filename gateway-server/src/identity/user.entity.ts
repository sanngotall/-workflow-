import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * 用户主表（对齐 SPEC-03 §3 #L114-#L131）
 * 系统全局唯一的登录账号主体，一个真实人类对应一个 User
 */
@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  username: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 255, name: 'password_hash' })
  password_hash: string; // bcrypt 哈希, cost=12

  @Column({ length: 50 })
  name: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'avatar_url' })
  avatar_url: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ length: 20, default: 'active' })
  status: string; // active, inactive, disabled

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updated_at: Date;

  @Column({ type: 'timestamp with time zone', nullable: true, name: 'last_login_at' })
  last_login_at: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true, name: 'deleted_at' })
  deleted_at: Date | null; // 软删除标记
}
