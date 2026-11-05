import { numericTransformer } from 'src/common/transformers';
import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'view_product_expanded_details',
  expression: `
  select
    p."companyUid",
    p.id as "productId",
    pe.id as "productEspecificationId",
    p."unitOfMeasure" ,
    p."productCategoryId" ,
    pc."name" as "productCategoryName",
    pc.color as "productCategoryColor",
    p."productPicture" ,
    CONCAT(p."name", ' ', pe."size", ' ', pe.color, ' ', pe.brand) as "productName",
    pe."costPrice" ,
    pe."isStockControlled" ,
    pe."salePrice" ,
    pe."size" ,
    pe."stockQuantity" ,
    pe."barcode",
    pe.brand ,
    pe.code ,
    pe.color,
    ps."name" as "supplierName",
    ps."id" as "productSupplierId",
    p."createdAt" ,
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
`,
})
export class ViewProductExpandedDetailsEntity {
  @ViewColumn()
  companyUid: string;

  @ViewColumn()
  productId: number;

  @ViewColumn()
  productName: string;

  @ViewColumn()
  productEspecificationId: number;

  @ViewColumn()
  unitOfMeasure: string;

  @ViewColumn()
  productCategoryId: number;

  @ViewColumn()
  productCategoryName: string;

  @ViewColumn()
  code: string;

  @ViewColumn()
  size: string;

  @ViewColumn()
  color: string;

  @ViewColumn()
  barcode: string;

  @ViewColumn()
  brand: string;

  @ViewColumn()
  salePrice: number;

  @ViewColumn()
  costPrice: number;

  @ViewColumn({
    transformer: numericTransformer,
  })
  stockQuantity: number;

  @ViewColumn()
  productSupplierId: number;

  @ViewColumn()
  isStockControlled: boolean;

  @ViewColumn()
  productPicture: string;

  @ViewColumn()
  createdAt: string;

  @ViewColumn()
  createdByUserEmployeeName: string;

  @ViewColumn()
  supplierName: string;

  @ViewColumn()
  productCategoryColor: string;
}
