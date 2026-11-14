import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductStockOverviewView1791500000000 implements MigrationInterface {
  name = 'AddProductStockOverviewView1791500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE OR REPLACE VIEW view_product_stock_overview AS
      select
        c.uid as "companyUid",
        count(pe.*) as "productsTotal",
        sum(pe."costPrice" * pe."stockQuantity") as "costPriceTotal",
        sum(pe."salePrice" * pe."stockQuantity") as "salePriceTotal",
        count(case when pe."stockQuantity" = 0 then 1 end) as "soldOutTotal"
      from
        product_especifications pe
      join products p on
        p.id = pe."productId"
      join companies c on
        c.uid = p."companyUid"
      where
        p."deletedAt" is null
        and pe."deletedAt" is null
      group by c.uid
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP VIEW IF EXISTS view_product_stock_overview`);
  }
}
