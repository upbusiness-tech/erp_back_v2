import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropCompanySettingPlanId1791100000000
  implements MigrationInterface
{
  name = 'DropCompanySettingPlanId1791100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "company_settings" DROP CONSTRAINT IF EXISTS "FK_b208815859706ffe6e3839fb6a8"',
    );
    await queryRunner.query(
      'ALTER TABLE "company_settings" DROP COLUMN IF EXISTS "planId"',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "company_settings" ADD COLUMN IF NOT EXISTS "planId" integer',
    );
    await queryRunner.query(
      'ALTER TABLE "company_settings" DROP CONSTRAINT IF EXISTS "FK_b208815859706ffe6e3839fb6a8"',
    );
    await queryRunner.query(
      'ALTER TABLE "company_settings" ADD CONSTRAINT "FK_b208815859706ffe6e3839fb6a8" FOREIGN KEY ("planId") REFERENCES "plans"("id")',
    );
  }
}
