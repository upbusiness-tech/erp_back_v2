import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMultiUnitOfMeasureSupport1787300000000
  implements MigrationInterface
{
  name = 'AddMultiUnitOfMeasureSupport1787300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 0. Drop views that depend on columns we need to alter
    await queryRunner.query(`DROP VIEW IF EXISTS view_product_expanded_details`);
    await queryRunner.query(`DROP VIEW IF EXISTS view_top_selling_products`);

    // 1. Alter product_especifications.stockQuantity to decimal(10,3)
    await queryRunner.query(
      `ALTER TABLE "product_especifications"
       ALTER COLUMN "stockQuantity" TYPE numeric(10,3)
       USING "stockQuantity"::numeric(10,3)`,
    );

    // 2. Alter sales_items.quantitySold to decimal(10,2)
    await queryRunner.query(
      `ALTER TABLE "sales_items"
       ALTER COLUMN "quantitySold" TYPE numeric(10,2)
       USING "quantitySold"::numeric(10,2)`,
    );

    // 3. Add unitSold and unitOfMeasure to sales_items
    await queryRunner.query(
      `ALTER TABLE "sales_items"
       ADD COLUMN IF NOT EXISTS "unitSold" numeric(10,3) NOT NULL DEFAULT 1`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales_items"
       ADD COLUMN IF NOT EXISTS "unitOfMeasure" varchar NOT NULL DEFAULT 'Unidade'`,
    );

    // 4. Alter product_transactions_records.value to decimal(10,3)
    await queryRunner.query(
      `ALTER TABLE "product_transactions_records"
       ALTER COLUMN "value" TYPE numeric(10,3)
       USING "value"::numeric(10,3)`,
    );

    // 5. Backfill: set unitSold=1 and unitOfMeasure from product for existing sales
    await queryRunner.query(
      `UPDATE "sales_items" si
       SET "unitOfMeasure" = p."unitOfMeasure"
       FROM "products" p
       WHERE si."productId" = p.id
         AND si."unitOfMeasure" = 'Unidade'
         AND p."unitOfMeasure" != 'Unidade'`,
    );

    // 6. Recreate view_product_expanded_details
    await queryRunner.query(`
      CREATE OR REPLACE VIEW view_product_expanded_details AS
      select
        p."companyUid" ,
        p.id ,
        p."name" ,
        p."unitOfMeasure",
        p."productCategoryId" ,
        pc."name" "productCategoryName",
        pe."code" ,
        pe."size",
        pe."color",
        pe."salePrice" ,
        pe."costPrice" ,
        pe."stockQuantity"
      from
        product_especifications pe
      inner join products p on
        p.id = pe."productId"
      left join product_categories pc on
        pc.id = p."productCategoryId"
    `);

    // 7. Recreate view_top_selling_products
    await queryRunner.query(`
      CREATE OR REPLACE VIEW view_top_selling_products AS
      SELECT
        s."companyUid",
        p.id AS "productId",
        p."name" AS "productName",
        pc."name" AS "productCategoryName",
        pe.id AS "productEspecificationId",
        pe."code",
        pe."size",
        pe."color",
        SUM(si."quantitySold" * si."unitSold") AS "totalQuantitySold",
        SUM(si."quantitySold" * si."unitSold" * si."salePriceSnapshot") AS "totalRevenue",
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
    // Drop views
    await queryRunner.query(`DROP VIEW IF EXISTS view_top_selling_products`);
    await queryRunner.query(`DROP VIEW IF EXISTS view_product_expanded_details`);

    // Remove new columns
    await queryRunner.query(
      `ALTER TABLE "sales_items" DROP COLUMN IF EXISTS "unitOfMeasure"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales_items" DROP COLUMN IF EXISTS "unitSold"`,
    );

    // Revert column types
    await queryRunner.query(
      `ALTER TABLE "sales_items"
       ALTER COLUMN "quantitySold" TYPE integer
       USING "quantitySold"::integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_especifications"
       ALTER COLUMN "stockQuantity" TYPE integer
       USING "stockQuantity"::integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_transactions_records"
       ALTER COLUMN "value" TYPE integer
       USING "value"::integer`,
    );

    // Recreate views with original SQL
    await queryRunner.query(`
      CREATE OR REPLACE VIEW view_product_expanded_details AS
      select
        p."companyUid" ,
        p.id ,
        p."name" ,
        p."unitOfMeasure",
        p."productCategoryId" ,
        pc."name" "productCategoryName",
        pe."code" ,
        pe."size",
        pe."color",
        pe."salePrice" ,
        pe."costPrice" ,
        pe."stockQuantity"
      from
        product_especifications pe
      inner join products p on
        p.id = pe."productId"
      left join product_categories pc on
        pc.id = p."productCategoryId"
    `);

    await queryRunner.query(`
      CREATE OR REPLACE VIEW view_top_selling_products AS
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
}
