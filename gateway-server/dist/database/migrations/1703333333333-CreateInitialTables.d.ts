import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class CreateInitialTables1703333333333 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
