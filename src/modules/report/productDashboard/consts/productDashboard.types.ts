export type ProductDashboardDateRange = {
  from: string;
  to: string;
  fromDate: Date;
  toExclusiveDate: Date;
};

export type ProductDashboardEntry = {
  productId: number;
  productName: string;
  quantitySold: number;
  revenue: number;
  stockQuantity: number;
  turnover: number;
};

export type ProductDashboardResponse = {
  period: {
    from: string;
    to: string;
  };
  summary: {
    unitsSold: number;
    revenue: number;
    featuredProduct: ProductDashboardEntry | null;
    zeroStockProducts: number;
  };
  rankings: {
    bestSelling: ProductDashboardEntry[];
    highestRevenue: ProductDashboardEntry[];
    highestTurnover: ProductDashboardEntry[];
    urgentRestock: ProductDashboardEntry[];
  };
};
