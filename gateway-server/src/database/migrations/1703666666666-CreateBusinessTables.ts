import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 创建业务数据存储元数据表（对齐 SPEC-03 §5.1）
 * business_tables + business_fields
 * 物理业务表由 BusinessTableService 动态建表（DDL 规范见 SPEC-03 §5.2）
 */
export class CreateBusinessTables1703666666666 implements MigrationInterface {
  name = 'CreateBusinessTables1703666666666';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. 业务表元数据
    await queryRunner.query(`
      CREATE TABLE business_tables (
        id UUID PRIMARY KEY,
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        table_name VARCHAR(100) NOT NULL,
        display_name VARCHAR(100) NOT NULL,
        storage_type VARCHAR(20) NOT NULL,
        ttl_seconds INTEGER,
        source VARCHAR(20) NOT NULL,
        row_count BIGINT NOT NULL DEFAULT 0,
        size_mb NUMERIC(10,2) NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(project_id, table_name),
        UNIQUE(table_name),
        CONSTRAINT chk_biztbl_storage CHECK (storage_type IN ('persistent', 'cache')),
        CONSTRAINT chk_biztbl_source CHECK (source IN ('request', 'response', 'mixed')),
        CONSTRAINT chk_biztbl_ttl CHECK (
          (storage_type = 'persistent' AND ttl_seconds IS NULL)
          OR (storage_type = 'cache' AND ttl_seconds >= 60)
        )
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_biztbl_project ON business_tables(project_id)`);
    await queryRunner.query(`CREATE UNIQUE INDEX uq_biztbl_table_name ON business_tables(table_name)`);

    // 2. 业务表字段元数据
    await queryRunner.query(`
      CREATE TABLE business_fields (
        id UUID PRIMARY KEY,
        business_table_id UUID NOT NULL REFERENCES business_tables(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(20) NOT NULL,
        source VARCHAR(20) NOT NULL,
        enabled BOOLEAN NOT NULL DEFAULT TRUE,
        nullable BOOLEAN NOT NULL DEFAULT TRUE,
        is_primary_key BOOLEAN NOT NULL DEFAULT FALSE,
        description TEXT,
        position INTEGER NOT NULL DEFAULT 0,
        UNIQUE(business_table_id, name),
        CONSTRAINT chk_bizfld_type CHECK (type IN ('string', 'number', 'boolean', 'json', 'timestamp')),
        CONSTRAINT chk_bizfld_source CHECK (source IN ('request', 'response', 'system'))
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_bizfld_table ON business_fields(business_table_id)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE business_fields`);
    await queryRunner.query(`DROP TABLE business_tables`);
  }
}
