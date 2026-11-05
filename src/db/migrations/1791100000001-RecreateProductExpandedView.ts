import { MigrationInterface, QueryRunner } from 'typeorm';

export class RecreateProductExpandedView1791100000001
  implements MigrationInterface
{
  name = 'RecreateProductExpandedView1791100000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP VIEW IF EXISTS view_product_expanded_details`,
    );
    await queryRunner.query(`
      CREATE VIEW view_product_expanded_details AS
      select
        p."companyUid",
        p.id as "productId",
        pe.id as "productEspecificationId",
        p."unitOfMeasure",
        p."productCategoryId",
        pc."name" as "productCategoryName",
        pc.color as "productCategoryColor",
        p."productPicture",
        CONCAT(p."name", ' ', pe."size", ' ', pe.color, ' ', pe.brand) as "productName",
        pe."costPrice",
        pe."isStockControlled",
        pe."salePrice",
        pe."size",
        pe."stockQuantity",
        pe."barcode",
        pe.brand,
        pe.code,
        pe.color,
        ps."name" as "supplierName",
        ps."id" as "productSupplierId",
        p."createdAt",
        e."name" as "createdByUserEmployeeName"
      from
        product_especifications pe
      join products p on
        p.id = pe."productId"
      left join users u on
        p."createByUserUid" = u.uid
      left join employees e on
        e.uid = u."employeeUid"
      left join product_categories pc on
        pc.id = p."productCategoryId"
      left join product_suppliers ps on
        ps.id = pe."productSupplierId"
      where
        p."deletedAt" is null and pe."deletedAt" is null
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP VIEW IF EXISTS view_product_expanded_details`,
    );
    await queryRunner.query(`
      CREATE VIEW view_product_expanded_details AS
      select
        p."companyUid",
        p.id,
        p."name",
        p."unitOfMeasure",
        p."productCategoryId",
        pc."name" as "productCategoryName",
        pe."code",
        pe."size",
        pe."color",
        pe."salePrice",
        pe."costPrice",
        pe."stockQuantity"
      from
        product_especifications pe
      inner join products p on
        p.id = pe."productId"
      left join product_categories pc on
        pc.id = p."productCategoryId"
    `);
  }
}
