import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 新增 CHECK 约束与 credentials.updated_at 字段
 * 对齐 SPEC-03 §1（credentials.updated_at）与 §4（CHECK 约束强化）
 */
export class AddCheckConstraintsAndCredentialUpdatedAt1703444444444 implements MigrationInterface {
  name = 'AddCheckConstraintsAndCredentialUpdatedAt1703444444444';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. credentials 补 updated_at 字段（对齐 SPEC-03 §1 #L40）
    await queryRunner.query(`
      ALTER TABLE credentials
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    `);

    // 2. routes 表环境与方法枚举锁定（SPEC-03 §4）
    await queryRunner.query(`
      ALTER TABLE routes ADD CONSTRAINT chk_routes_env
        CHECK (environment IN ('dev', 'staging', 'prod'))
    `);
    await queryRunner.query(`
      ALTER TABLE routes ADD CONSTRAINT chk_routes_method
        CHECK (method IN ('GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'ANY'))
    `);

    // 3. transformers 表类型锁定
    await queryRunner.query(`
      ALTER TABLE transformers ADD CONSTRAINT chk_transformers_type
        CHECK (type IN ('visual', 'script'))
    `);

    // 4. credentials 表类型锁定
    await queryRunner.query(`
      ALTER TABLE credentials ADD CONSTRAINT chk_credentials_type
        CHECK (type IN ('Bearer', 'Basic', 'Custom'))
    `);

    // 5. request_logs 表 http_status 范围
    await queryRunner.query(`
      ALTER TABLE request_logs ADD CONSTRAINT chk_logs_status
        CHECK (http_status >= 100 AND http_status < 600)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE request_logs DROP CONSTRAINT IF EXISTS chk_logs_status`);
    await queryRunner.query(`ALTER TABLE credentials DROP CONSTRAINT IF EXISTS chk_credentials_type`);
    await queryRunner.query(`ALTER TABLE transformers DROP CONSTRAINT IF EXISTS chk_transformers_type`);
    await queryRunner.query(`ALTER TABLE routes DROP CONSTRAINT IF EXISTS chk_routes_method`);
    await queryRunner.query(`ALTER TABLE routes DROP CONSTRAINT IF EXISTS chk_routes_env`);
    await queryRunner.query(`ALTER TABLE credentials DROP COLUMN IF EXISTS updated_at`);
  }
}
