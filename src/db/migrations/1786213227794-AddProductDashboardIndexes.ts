import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductDashboardIndexes1786213227794 implements MigrationInterface {
  name = 'AddProductDashboardIndexes1786213227794';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_sales_dashboard_company_status_date" ON "sales" ("companyUid", "status", "createdAt", "id") WHERE "deletedAt" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_sales_items_dashboard_sale_product" ON "sales_items" ("saleId", "productId") WHERE "deletedAt" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_products_dashboard_company_id" ON "products" ("companyUid", "id") WHERE "deletedAt" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_product_specs_dashboard_product" ON "product_especifications" ("productId") WHERE "deletedAt" IS NULL`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_product_specs_dashboard_product"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_products_dashboard_company_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_sales_items_dashboard_sale_product"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_sales_dashboard_company_status_date"`,
    );
  }
}
