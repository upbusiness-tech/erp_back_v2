import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSaleDiscountsAndSnapshots1786213227793 implements MigrationInterface {
  name = 'AddSaleDiscountsAndSnapshots1786213227793';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Sales: discount, totals and summary
    await queryRunner.query(
      `ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "discount" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "total" numeric(10,2) NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "amountPaid" numeric(10,2) NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "change" numeric(10,2) NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "summary" jsonb`,
    );

    // 2. Sales items: snapshots and discountInfo
    await queryRunner.query(
      `ALTER TABLE "sales_items" ADD COLUMN IF NOT EXISTS "productSnapshot" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales_items" ADD COLUMN IF NOT EXISTS "salePriceSnapshot" numeric(10,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales_items" ADD COLUMN IF NOT EXISTS "specialPriceSnapshot" numeric(10,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales_items" ADD COLUMN IF NOT EXISTS "costPriceSnapshot" numeric(10,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales_items" ADD COLUMN IF NOT EXISTS "discountInfo" jsonb`,
    );

    // 3. Sales services: snapshot and discount
    await queryRunner.query(
      `ALTER TABLE "sales_services" ADD COLUMN IF NOT EXISTS "amountSnapshot" numeric(10,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales_services" ADD COLUMN IF NOT EXISTS "discount" jsonb`,
    );

    // 4. Adjust existing monetary columns
    await queryRunner.query(
      `ALTER TABLE "sale_payments" ALTER COLUMN "amount" TYPE numeric(10,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales_services" ALTER COLUMN "amount" TYPE numeric(10,2)`,
    );

    // 5. Migrate existing discountPrice values into discountInfo
    await queryRunner.query(
      `UPDATE "sales_items" SET "discountInfo" = jsonb_build_object('value', "discountPrice") WHERE "discountPrice" IS NOT NULL`,
    );

    // 6. Drop the old discountPrice column
    await queryRunner.query(
      `ALTER TABLE "sales_items" DROP COLUMN IF EXISTS "discountPrice"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Restore discountPrice column
    await queryRunner.query(
      `ALTER TABLE "sales_items" ADD COLUMN IF NOT EXISTS "discountPrice" decimal`,
    );

    // Copy discountInfo.value back to discountPrice
    await queryRunner.query(
      `UPDATE "sales_items" SET "discountPrice" = ("discountInfo"->>'value')::numeric WHERE "discountInfo" ? 'value'`,
    );

    // Remove new columns
    await queryRunner.query(
      `ALTER TABLE "sales_items" DROP COLUMN IF EXISTS "discountInfo"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales_items" DROP COLUMN IF EXISTS "costPriceSnapshot"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales_items" DROP COLUMN IF EXISTS "specialPriceSnapshot"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales_items" DROP COLUMN IF EXISTS "salePriceSnapshot"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales_items" DROP COLUMN IF EXISTS "productSnapshot"`,
    );

    await queryRunner.query(
      `ALTER TABLE "sales_services" DROP COLUMN IF EXISTS "discount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales_services" DROP COLUMN IF EXISTS "amountSnapshot"`,
    );

    await queryRunner.query(
      `ALTER TABLE "sales" DROP COLUMN IF EXISTS "summary"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales" DROP COLUMN IF EXISTS "change"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales" DROP COLUMN IF EXISTS "amountPaid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales" DROP COLUMN IF EXISTS "total"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales" DROP COLUMN IF EXISTS "discount"`,
    );

    // Revert monetary column types
    await queryRunner.query(
      `ALTER TABLE "sale_payments" ALTER COLUMN "amount" TYPE decimal`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales_services" ALTER COLUMN "amount" TYPE decimal`,
    );
  }
}
