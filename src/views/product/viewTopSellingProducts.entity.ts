import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'view_top_selling_products',
  expression: `
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
  `,
})
export class ViewTopSellingProductsEntity {
  @ViewColumn()
  companyUid: string;

  @ViewColumn()
  productId: number;

  @ViewColumn()
  productName: string;

  @ViewColumn()
  productCategoryName: string;

  @ViewColumn()
  productEspecificationId: number;

  @ViewColumn()
  code: string;

  @ViewColumn()
  size: string;

  @ViewColumn()
  color: string;

  @ViewColumn()
  totalQuantitySold: number;

  @ViewColumn()
  totalRevenue: number;

  @ViewColumn()
  totalSales: number;
}
