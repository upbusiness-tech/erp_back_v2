import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSalesDashboardIndexes1786213227795 implements MigrationInterface {
  name = 'AddSalesDashboardIndexes1786213227795';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_sale_payments_dashboard_sale_type" ON "sale_payments" ("saleId", "type") WHERE "deletedAt" IS NULL`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_sale_payments_dashboard_sale_type"`,
    );
  }
}
