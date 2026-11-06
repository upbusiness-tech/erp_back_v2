import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSpecialPriceSourceToSalesItems1791300000000 implements MigrationInterface {
  name = 'AddSpecialPriceSourceToSalesItems1791300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sales_items" ADD COLUMN IF NOT EXISTS "specialPriceSource" varchar NOT NULL DEFAULT 'CATALOG'`,
    );

    await queryRunner.query(
      `UPDATE "sales_items"
       SET "specialPriceSource" = CASE
         WHEN "internCustomerPriceId" IS NOT NULL THEN 'CUSTOMER_TABLE'
         WHEN "specialPriceSnapshot" IS NOT NULL THEN 'NEGOTIATED'
         ELSE 'CATALOG'
       END`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sales_items" DROP COLUMN IF EXISTS "specialPriceSource"`,
    );
  }
}
