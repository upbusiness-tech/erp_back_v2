import { numericTransformer } from 'src/common/transformers';
import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'view_product_transaction_details',
  expression: `
  select
    ptr.id,
    p.id as "productId",
    pe.color ,
    pe.brand ,
    pe.size,
    ptr."type" ,
    ptr."value" ,
    e."name" "createdBy",
    s."createdAt" as "saleDate",
    ptr."createdAt" as "transactionDate",
    s.code as "saleCode",
    s.total as "saleTotal"
  from
    product_transactions_records ptr
  left join sales s on
    ptr."saleId" = s.id
  inner join product_especifications pe on
    pe.id = ptr."productEspecificationId"
  inner join products p on 
    p.id = pe."productId"
  inner join users u on
    u.uid = ptr."createdByUserUid" 
  inner join employees e on
    e.uid = u."employeeUid" 
  order by 
    ptr."createdAt" desc `,
})
export class ViewProductTransactionDetailsEntity {
  @ViewColumn()
  id: number;

  @ViewColumn()
  productId: string;

  @ViewColumn()
  color: string;

  @ViewColumn()
  brand: string;

  @ViewColumn()
  size: string;

  @ViewColumn()
  type: string;

  @ViewColumn()
  createdBy: string;

  @ViewColumn()
  transactionDate: string;

  @ViewColumn({
    transformer: numericTransformer,
  })
  value: number;

  @ViewColumn()
  saleDate: string;

  @ViewColumn()
  saleCode: string;

  @ViewColumn()
  saleTotal: number;
}
