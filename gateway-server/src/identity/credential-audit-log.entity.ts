import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

/**
 * 凭证解密审计表（对齐 SPEC-03 §3 #L162-#L170）
 * 所有 API Key 的创建、查看、轮换、删除、解密操作均会记录在此
 * 满足 AGENTS.md Rule 3 凭证安全审计要求
 */
@Entity('credential_audit_logs')
export class CredentialAuditLogEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'uuid', name: 'credential_id', nullable: true })
  credential_id: string | null;

  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  user_id: string | null;

  @Column({ length: 30 })
  action: string; // create, view, update, delete, decrypt

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'client_ip' })
  client_ip: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  created_at: Date;
}
