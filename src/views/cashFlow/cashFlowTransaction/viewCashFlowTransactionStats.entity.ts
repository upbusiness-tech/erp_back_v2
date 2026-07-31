import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'view_cash_flow_transaction_stats',
  expression: `
  select
    "cashFlowId",
    coalesce(origin, 'Total Geral') as origin,
    SUM(amount) as amount,
    COUNT(*) as quantity
  from
    cash_flow_transactions
  where
    "deletedAt" is null
  group by
    "cashFlowId",
    rollup(origin)
  order by
    "cashFlowId",
    origin;`,
})
export class ViewCashFlowTransactionStatsEntity {
  @ViewColumn()
  cashFlowId: number;

  @ViewColumn()
  origin: string;

  @ViewColumn()
  amount: number;

  @ViewColumn()
  quantity: number;
}
