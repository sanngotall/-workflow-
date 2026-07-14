import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class CreateIdentityTables1703555555555 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
