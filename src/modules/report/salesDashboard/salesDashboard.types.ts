import type { PaymentMethod } from 'src/modules/sale/submodules/salePayment/salePayment.enum';
import type { SaleType } from 'src/modules/sale/sale.enum';

export type SalesDashboardDateRange = {
  from: string;
  to: string;
  fromDate: Date;
  toExclusiveDate: Date;
};

export type SalesDashboardFilters = {
  paymentType: PaymentMethod[];
  saleType: SaleType[];
  customerName: string | null;
  saleCode: string | null;
};

export type SalesDashboardResponse = {
  period: {
    from: string;
    to: string;
  };
  filters: SalesDashboardFilters;
  summary: {
    filteredSales: number;
    total: number;
  };
  paymentBreakdown: SalesDashboardPaymentAggregate[];
};

export type SalesDashboardPaymentAggregate = {
  type: PaymentMethod;
  amount: number;
};
