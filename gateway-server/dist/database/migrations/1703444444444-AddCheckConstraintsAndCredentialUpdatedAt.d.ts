import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddCheckConstraintsAndCredentialUpdatedAt1703444444444 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
