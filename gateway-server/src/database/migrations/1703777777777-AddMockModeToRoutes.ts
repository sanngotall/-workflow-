import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 为 routes 表添加 Mock 模式字段（对齐 SPEC-00 IN-SCOPE 第 6 项 [Mock-Mode]）
 *
 * - is_mock BOOLEAN：Mock 开关，true 时网关层阻断向下游派发
 * - mock_response JSONB：静态 Mock 响应体
 *
 * 网关层 GatewayService.handleRequest 在 transformRequest 前检查 is_mock，
 * 是则直接返回 mock_response，不走 transformer/credential/dispatch。
 */
export class AddMockModeToRoutes1703777777777 implements MigrationInterface {
  name = 'AddMockModeToRoutes1703777777777';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE routes
        ADD COLUMN IF NOT EXISTS is_mock BOOLEAN NOT NULL DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS mock_response JSONB;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE routes
        DROP COLUMN IF EXISTS mock_response,
        DROP COLUMN IF EXISTS is_mock;
    `);
  }
}
