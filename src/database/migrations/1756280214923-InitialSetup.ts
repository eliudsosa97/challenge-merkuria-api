import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSetup1756280214923 implements MigrationInterface {
    name = 'InitialSetup1756280214923'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "category" character varying(100) NOT NULL, "price" numeric(10,2) NOT NULL, "rating" numeric(2,1) NOT NULL DEFAULT '0', "stock" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "products"`);
    }

}
