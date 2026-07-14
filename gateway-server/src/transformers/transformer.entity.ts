import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { RouteEntity } from '../routes/route.entity';
import { CredentialEntity } from '../credentials/credential.entity';

@Entity('transformers')
export class TransformerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  route_id: string;

  @ManyToOne(() => RouteEntity, (route) => route.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'route_id' })
  route: RouteEntity;

  @Column({ type: 'uuid', nullable: true })
  credential_id: string;

  @ManyToOne(() => CredentialEntity, (credential) => credential.id, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'credential_id' })
  credential: CredentialEntity;

  @Column({ type: 'text' })
  target_url: string;

  @Column({ length: 64 })
  type: string;

  @Column({ type: 'jsonb', nullable: true })
  mapping_rules: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  script_code: string;

  @Column({ type: 'jsonb', nullable: true })
  response_rules: Record<string, any>;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
