import { PaymentMethod } from 'src/modules/sale/submodules/salePayment/salePayment.enum';

export enum ESaleDateGroup {
  HOUR = 'hour',
  DAY = 'day',
  MONTH = 'month',
  WEEK = 'week',
}

export interface StatisticSaleRevenueOverviewRow {
  salesTotal: string;
  grossRevenue: string | null;
  profitRevenue: string | null;
  averageTicket: string | null;
}

export interface StatisticSalePaymentDistributionRow {
  type: PaymentMethod;
  amountPaid: string | null;
}

export interface StatisticSaleRevenueGroupedByDateRow {
  saleDate: Date;
  saleQuantity: string;
  grossRevenue: string | null;
  profitRevenue: string | null;
}

export type SaleDayOfWeekMetric = 'Faturamento Bruto' | 'Lucro' | 'Qtd Vendas';

export interface StatisticSaleStatsByDayOfWeekRow {
  metric: SaleDayOfWeekMetric;
  dom: string;
  seg: string;
  ter: string;
  qua: string;
  qui: string;
  sex: string;
  sab: string;
}

// ---- Response shapes (clean, numeric) ----

export interface StatisticSaleOverviewResponse {
  salesTotal: number;
  grossRevenue: number;
  profitRevenue: number;
  averageTicket: number;
}

export interface StatisticSalePaymentDistributionResponse {
  type: PaymentMethod;
  amountPaid: number;
}

export interface StatisticSaleTimelinePointResponse {
  saleDate: string;
  saleQuantity: number;
  grossRevenue: number;
  profitRevenue: number;
}

export interface StatisticSaleWeekdayRevenueResponse {
  weekday: number;
  label: string;
  revenue: number;
}

export interface StatisticSaleHistoryOverviewResponse {
  overview: StatisticSaleOverviewResponse;
  paymentDistribution: StatisticSalePaymentDistributionResponse[];
  timeline: StatisticSaleTimelinePointResponse[];
  weekdayRevenue: StatisticSaleWeekdayRevenueResponse[];
}
