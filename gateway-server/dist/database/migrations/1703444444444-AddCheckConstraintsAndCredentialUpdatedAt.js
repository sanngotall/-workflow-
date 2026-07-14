"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddCheckConstraintsAndCredentialUpdatedAt1703444444444 = void 0;
class AddCheckConstraintsAndCredentialUpdatedAt1703444444444 {
    constructor() {
        this.name = 'AddCheckConstraintsAndCredentialUpdatedAt1703444444444';
    }
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE credentials
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    `);
        await queryRunner.query(`
      ALTER TABLE routes ADD CONSTRAINT chk_routes_env
        CHECK (environment IN ('dev', 'staging', 'prod'))
    `);
        await queryRunner.query(`
      ALTER TABLE routes ADD CONSTRAINT chk_routes_method
        CHECK (method IN ('GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'ANY'))
    `);
        await queryRunner.query(`
      ALTER TABLE transformers ADD CONSTRAINT chk_transformers_type
        CHECK (type IN ('visual', 'script'))
    `);
        await queryRunner.query(`
      ALTER TABLE credentials ADD CONSTRAINT chk_credentials_type
        CHECK (type IN ('Bearer', 'Basic', 'Custom'))
    `);
        await queryRunner.query(`
      ALTER TABLE request_logs ADD CONSTRAINT chk_logs_status
        CHECK (http_status >= 100 AND http_status < 600)
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE request_logs DROP CONSTRAINT IF EXISTS chk_logs_status`);
        await queryRunner.query(`ALTER TABLE credentials DROP CONSTRAINT IF EXISTS chk_credentials_type`);
        await queryRunner.query(`ALTER TABLE transformers DROP CONSTRAINT IF EXISTS chk_transformers_type`);
        await queryRunner.query(`ALTER TABLE routes DROP CONSTRAINT IF EXISTS chk_routes_method`);
        await queryRunner.query(`ALTER TABLE routes DROP CONSTRAINT IF EXISTS chk_routes_env`);
        await queryRunner.query(`ALTER TABLE credentials DROP COLUMN IF EXISTS updated_at`);
    }
}
exports.AddCheckConstraintsAndCredentialUpdatedAt1703444444444 = AddCheckConstraintsAndCredentialUpdatedAt1703444444444;
//# sourceMappingURL=1703444444444-AddCheckConstraintsAndCredentialUpdatedAt.js.map