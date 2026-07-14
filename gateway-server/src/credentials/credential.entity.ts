import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ProjectEntity } from '../projects/project.entity';

@Entity('credentials')
export class CredentialEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  project_id: string;

  @ManyToOne(() => ProjectEntity, (project) => project.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: ProjectEntity;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 50 })
  type: string;

  @Column({ type: 'text' })
  encrypted_secret: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  // 凭证轮换审计依据，对齐 SPEC-03 §1 #L40
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
