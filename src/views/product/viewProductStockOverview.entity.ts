import { numericTransformer } from 'src/common/transformers';
import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'view_product_stock_overview',
  expression: `
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
  group by c.uid`,
})
export class ViewProductStockOverviewEntity {
  @ViewColumn()
  companyUid: string;

  @ViewColumn({
    transformer: numericTransformer,
  })
  productsTotal: number;

  @ViewColumn({
    transformer: numericTransformer,
  })
  costPriceTotal: number;

  @ViewColumn({
    transformer: numericTransformer,
  })
  salePriceTotal: number;

  @ViewColumn({
    transformer: numericTransformer,
  })
  soldOutTotal: number;
}
