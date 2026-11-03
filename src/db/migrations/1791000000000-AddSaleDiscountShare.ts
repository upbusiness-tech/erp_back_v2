import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSaleDiscountShare1791000000000 implements MigrationInterface {
  name = 'AddSaleDiscountShare1791000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "sales_items" ADD COLUMN IF NOT EXISTS "saleDiscountShare" numeric(10,2) NOT NULL DEFAULT 0',
    );
    await queryRunner.query(
      'ALTER TABLE "sales_services" ADD COLUMN IF NOT EXISTS "saleDiscountShare" numeric(10,2) NOT NULL DEFAULT 0',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "sales_services" DROP COLUMN IF EXISTS "saleDiscountShare"',
    );
    await queryRunner.query(
      'ALTER TABLE "sales_items" DROP COLUMN IF EXISTS "saleDiscountShare"',
    );
  }
}
