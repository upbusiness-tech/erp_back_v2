export enum EAlertsAndOpportunitiesColumns {
  UNDER_MIN_STOCK = 'underMinStock',
  OVER_MAX_STOCK = 'overMaxStock',
  SOLD_OUT_TOTAL = 'soldOutTotal',
  NO_SUPPLIER_INFORMED = 'noSupplierInformed',
}

export interface StatisticStockInOutRow {
  productExit: string | null;
  productExitSaleBalance: string | null;
  productEntry: string | null;
  productEntryBalance: string | null;
  productMoviments: string | null;
  periodBalance: string | null;
}

export interface StatisticStockAlertsAndOpportunitiesRow {
  [EAlertsAndOpportunitiesColumns.UNDER_MIN_STOCK]: string;
  [EAlertsAndOpportunitiesColumns.OVER_MAX_STOCK]: string;
  [EAlertsAndOpportunitiesColumns.SOLD_OUT_TOTAL]: string;
  [EAlertsAndOpportunitiesColumns.NO_SUPPLIER_INFORMED]: string;
}

export interface StatisticStockTopSellingProductsRow {
  name: string;
  size: string | null;
  color: string | null;
  brand: string | null;
  unitOfMeasure: string;
  quantitySold: string | null;
  salesAmount: string | null;
  salesProfitAmount: string | null;
}

export interface StatisticStockDistributionByCategoryRow {
  id: number;
  name: string;
  amountCategory: string;
}

export interface StatisticStockStatusByEspecificationRow {
  name: string;
  size: string | null;
  color: string | null;
  brand: string | null;
  unitOfMeasure: string;
  stockQuantity: string;
}

export interface StatisticStockStatusRow {
  name: string;
  stockQuantity: string | null;
}
