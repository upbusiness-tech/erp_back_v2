import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCashFlowCode1786827318000 implements MigrationInterface {
  name = 'AddCashFlowCode1786827318000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add code column (nullable first to allow backfill)
    await queryRunner.query(
      `ALTER TABLE "cash_flows" ADD COLUMN IF NOT EXISTS "code" varchar`,
    );

    // 2. Backfill existing rows with sequential codes per company
    await queryRunner.query(
      `UPDATE "cash_flows" cf
       SET "code" = lp."code"
       FROM (
         SELECT "id", lpad(row_number() OVER (PARTITION BY "companyUid" ORDER BY "id")::text, 6, '0') AS "code"
         FROM "cash_flows"
       ) lp
       WHERE cf."id" = lp."id"`,
    );

    // 3. Enforce NOT NULL and per-company uniqueness
    await queryRunner.query(
      `ALTER TABLE "cash_flows" ALTER COLUMN "code" SET NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "UQ_cash_flows_companyUid_code" ON "cash_flows" ("companyUid", "code")`,
    );

    // 4. Create sequence table for code generation
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "cash_flow_code_sequence" (
        "id" SERIAL NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        "companyUid" varchar NOT NULL,
        "lastNumber" integer NOT NULL DEFAULT 0,
        CONSTRAINT "PK_cash_flow_code_sequence" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "UQ_cash_flow_code_sequence_companyUid" ON "cash_flow_code_sequence" ("companyUid")`,
    );

    // 5. Seed sequence with existing counts per company
    await queryRunner.query(
      `INSERT INTO "cash_flow_code_sequence" ("companyUid", "lastNumber")
       SELECT "companyUid", COUNT(*)::int FROM "cash_flows" GROUP BY "companyUid"
       ON CONFLICT ("companyUid")
       DO UPDATE SET "lastNumber" = GREATEST("cash_flow_code_sequence"."lastNumber", EXCLUDED."lastNumber")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "cash_flow_code_sequence"`);

    await queryRunner.query(
      `DROP INDEX IF EXISTS "UQ_cash_flows_companyUid_code"`,
    );

    await queryRunner.query(
      `ALTER TABLE "cash_flows" DROP COLUMN IF EXISTS "code"`,
    );
  }
}
