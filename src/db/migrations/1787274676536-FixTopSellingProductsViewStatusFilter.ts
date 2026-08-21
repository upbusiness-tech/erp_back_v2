import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixTopSellingProductsViewStatusFilter1787274676536
  implements MigrationInterface
{
  name = 'FixTopSellingProductsViewStatusFilter1787274676536';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Recria a view com o filtro de status correto:
    // 'Concluida' (sem acento) -> 'Concluída' (valor exato de SaleStatus.COMPLETED)
    await queryRunner.query(`DROP VIEW IF EXISTS "view_top_selling_products"`);
    await queryRunner.query(`
      CREATE VIEW "view_top_selling_products" AS
        SELECT
          s."companyUid",
          p.id AS "productId",
          p."name" AS "productName",
          pc."name" AS "productCategoryName",
          pe.id AS "productEspecificationId",
          pe."code",
          pe."size",
          pe."color",
          SUM(si."quantitySold") AS "totalQuantitySold",
          SUM(si."quantitySold" * si."salePriceSnapshot") AS "totalRevenue",
          COUNT(si.id) AS "totalSales"
        FROM sales_items si
        INNER JOIN sales s ON s.id = si."saleId"
          AND s.status = 'Concluída'
          AND s."deletedAt" IS NULL
        INNER JOIN product_especifications pe ON pe.id = si."productEspecificationId"
        INNER JOIN products p ON p.id = si."productId"
        LEFT JOIN product_categories pc ON pc.id = p."productCategoryId"
        WHERE si."deletedAt" IS NULL
        GROUP BY s."companyUid", p.id, p."name", pc."name", pe.id, pe."code", pe."size", pe."color"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Restaura a expressão original (com o filtro incorreto) para reversibilidade
    await queryRunner.query(`DROP VIEW IF EXISTS "view_top_selling_products"`);
    await queryRunner.query(`
      CREATE VIEW "view_top_selling_products" AS
        SELECT
          s."companyUid",
          p.id AS "productId",
          p."name" AS "productName",
          pc."name" AS "productCategoryName",
          pe.id AS "productEspecificationId",
          pe."code",
          pe."size",
          pe."color",
          SUM(si."quantitySold") AS "totalQuantitySold",
          SUM(si."quantitySold" * si."salePriceSnapshot") AS "totalRevenue",
          COUNT(si.id) AS "totalSales"
        FROM sales_items si
        INNER JOIN sales s ON s.id = si."saleId"
          AND s.status = 'Concluida'
          AND s."deletedAt" IS NULL
        INNER JOIN product_especifications pe ON pe.id = si."productEspecificationId"
        INNER JOIN products p ON p.id = si."productId"
        LEFT JOIN product_categories pc ON pc.id = p."productCategoryId"
        WHERE si."deletedAt" IS NULL
        GROUP BY s."companyUid", p.id, p."name", pc."name", pe.id, pe."code", pe."size", pe."color"
    `);
  }
}
