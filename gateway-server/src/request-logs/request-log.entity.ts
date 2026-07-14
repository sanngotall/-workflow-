import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('request_logs')
export class RequestLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  project_id: string;

  @Column({ type: 'uuid', nullable: true })
  route_id: string;

  @Column({ length: 20 })
  environment: string;

  @Column({ length: 50, nullable: true })
  client_ip: string;

  @Column({ length: 10 })
  method: string;

  @Column({ type: 'text' })
  path: string;

  @Column({ type: 'text', nullable: true })
  request_body_raw: string;

  @Column({ type: 'text', nullable: true })
  transformed_body_raw: string;

  @Column({ type: 'text', nullable: true })
  response_body_raw: string;

  @Column({ type: 'integer' })
  http_status: number;

  @Column({ length: 50, nullable: true })
  error_code: string;

  @Column({ type: 'integer' })
  latency_ms: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;
}
