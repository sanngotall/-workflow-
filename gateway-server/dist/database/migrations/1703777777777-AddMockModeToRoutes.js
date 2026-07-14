"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddMockModeToRoutes1703777777777 = void 0;
class AddMockModeToRoutes1703777777777 {
    constructor() {
        this.name = 'AddMockModeToRoutes1703777777777';
    }
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE routes
        ADD COLUMN IF NOT EXISTS is_mock BOOLEAN NOT NULL DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS mock_response JSONB;
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE routes
        DROP COLUMN IF EXISTS mock_response,
        DROP COLUMN IF EXISTS is_mock;
    `);
    }
}
exports.AddMockModeToRoutes1703777777777 = AddMockModeToRoutes1703777777777;
//# sourceMappingURL=1703777777777-AddMockModeToRoutes.js.map