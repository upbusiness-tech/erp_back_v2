import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'view_product_expanded_details',
  expression: `
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
    pc.id = p."productCategoryId" `,
})
export class ViewProductExpandedDetailsEntity {
  @ViewColumn()
  companyUid: string;

  @ViewColumn()
  id: number;

  @ViewColumn()
  name: string;

  @ViewColumn()
  productCategoryId: number;

  @ViewColumn()
  productCategoryName: string;

  @ViewColumn()
  unitOfMeasure: string;

  @ViewColumn()
  code: string;

  @ViewColumn()
  size: string;

  @ViewColumn()
  color: string;

  @ViewColumn()
  salePrice: number;

  @ViewColumn()
  costPrice: number;

  @ViewColumn()
  stockQuantity: number;
}
