import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialTables1703333333333 implements MigrationInterface {
  name = 'CreateInitialTables1703333333333';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE projects (
        id UUID PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_projects_name ON projects(name)`);

    await queryRunner.query(`
      CREATE TABLE credentials (
        id UUID PRIMARY KEY,
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(50) NOT NULL,
        encrypted_secret TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE routes (
        id UUID PRIMARY KEY,
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        environment VARCHAR(20) NOT NULL DEFAULT 'prod',
        method VARCHAR(10) NOT NULL,
        path VARCHAR(255) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        is_async BOOLEAN DEFAULT FALSE,
        timeout_ms INTEGER DEFAULT 15000,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_project_env_method_path UNIQUE(project_id, environment, method, path)
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_routes_match ON routes(project_id, environment, method, path)`);

    await queryRunner.query(`
      CREATE TABLE transformers (
        id UUID PRIMARY KEY,
        route_id UUID REFERENCES routes(id) ON DELETE CASCADE UNIQUE,
        credential_id UUID REFERENCES credentials(id) ON DELETE SET NULL,
        target_url TEXT NOT NULL,
        type VARCHAR(20) NOT NULL,
        mapping_rules JSONB,
        script_code TEXT,
        response_rules JSONB,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE request_logs (
        id BIGSERIAL PRIMARY KEY,
        project_id UUID NOT NULL,
        route_id UUID,
        environment VARCHAR(20) NOT NULL,
        client_ip VARCHAR(50),
        method VARCHAR(10) NOT NULL,
        path TEXT NOT NULL,
        request_body_raw TEXT,
        transformed_body_raw TEXT,
        response_body_raw TEXT,
        http_status INTEGER NOT NULL,
        error_code VARCHAR(50) DEFAULT NULL,
        latency_ms INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_logs_project_env ON request_logs(project_id, environment)`);
    await queryRunner.query(`CREATE INDEX idx_logs_created_at ON request_logs(created_at DESC)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE request_logs`);
    await queryRunner.query(`DROP TABLE transformers`);
    await queryRunner.query(`DROP TABLE routes`);
    await queryRunner.query(`DROP TABLE credentials`);
    await queryRunner.query(`DROP TABLE projects`);
  }
}
