export interface DiscountInfo {
  value?: number;
  percent?: number;
  reason?: string;
}

export interface SaleSummary {
  items: number;
  services: number;
  itemDiscounts: number;
  serviceDiscounts: number;
  subtotal: number;
  saleDiscount: number;
  total: number;
  paid: number;
  change: number;
}
