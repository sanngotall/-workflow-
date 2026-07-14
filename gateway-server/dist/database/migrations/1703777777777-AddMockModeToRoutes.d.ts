import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddMockModeToRoutes1703777777777 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
