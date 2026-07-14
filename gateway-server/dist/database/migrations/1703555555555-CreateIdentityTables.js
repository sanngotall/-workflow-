"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateIdentityTables1703555555555 = void 0;
class CreateIdentityTables1703555555555 {
    constructor() {
        this.name = 'CreateIdentityTables1703555555555';
    }
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE users (
        id UUID PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(50) NOT NULL,
        avatar_url VARCHAR(500),
        phone VARCHAR(20),
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        last_login_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP WITH TIME ZONE,
        CONSTRAINT chk_users_status CHECK (status IN ('active', 'inactive', 'disabled'))
      )
    `);
        await queryRunner.query(`CREATE INDEX idx_users_username ON users(username)`);
        await queryRunner.query(`CREATE INDEX idx_users_email ON users(email)`);
        await queryRunner.query(`CREATE INDEX idx_users_status ON users(status) WHERE deleted_at IS NULL`);
        await queryRunner.query(`
      CREATE TABLE project_members (
        id UUID PRIMARY KEY,
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(20) NOT NULL DEFAULT 'developer',
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(project_id, user_id),
        CONSTRAINT chk_member_role CHECK (
          role IN ('admin','architect','developer','editor','ops','tester','operator','analyst','viewer')
        )
      )
    `);
        await queryRunner.query(`CREATE INDEX idx_pm_project ON project_members(project_id)`);
        await queryRunner.query(`CREATE INDEX idx_pm_user ON project_members(user_id)`);
        await queryRunner.query(`
      CREATE TABLE global_roles (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(20) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, role),
        CONSTRAINT chk_global_role CHECK (role IN ('super_admin', 'admin'))
      )
    `);
        await queryRunner.query(`CREATE INDEX idx_global_roles_user ON global_roles(user_id)`);
        await queryRunner.query(`
      CREATE TABLE credential_audit_logs (
        id BIGSERIAL PRIMARY KEY,
        credential_id UUID REFERENCES credentials(id) ON DELETE SET NULL,
        user_id UUID,
        action VARCHAR(30) NOT NULL,
        client_ip VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
        await queryRunner.query(`CREATE INDEX idx_cred_audit_cred ON credential_audit_logs(credential_id, created_at DESC)`);
        await queryRunner.query(`
      CREATE TABLE config_snapshots (
        id UUID PRIMARY KEY,
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        version VARCHAR(50) NOT NULL,
        snapshot_json JSONB NOT NULL,
        created_by UUID REFERENCES users(id),
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(project_id, version)
      )
    `);
        await queryRunner.query(`CREATE INDEX idx_snapshot_project ON config_snapshots(project_id, created_at DESC)`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE config_snapshots`);
        await queryRunner.query(`DROP TABLE credential_audit_logs`);
        await queryRunner.query(`DROP TABLE global_roles`);
        await queryRunner.query(`DROP TABLE project_members`);
        await queryRunner.query(`DROP TABLE users`);
    }
}
exports.CreateIdentityTables1703555555555 = CreateIdentityTables1703555555555;
//# sourceMappingURL=1703555555555-CreateIdentityTables.js.map