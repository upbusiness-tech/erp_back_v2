import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource, SelectQueryBuilder } from 'typeorm';
import { SaleStatus, SaleType } from 'src/modules/sale/sale.enum';
import { PaymentMethod } from 'src/modules/sale/submodules/salePayment/salePayment.enum';
import type { SalesDashboardQueryDto } from './dto/salesDashboardQuery.dto';
import type {
  SalesDashboardPaymentAggregate,
  SalesDashboardResponse,
} from './salesDashboard.types';
import { normalizeSalesDashboardDateRange } from './salesDashboard.utils';

type DashboardParams = {
  companyUid: string;
  status: SaleStatus;
  fromDate: string;
  toDate: string;
  paymentTypes: PaymentMethod[];
  saleTypes: SaleType[];
  customerName?: string;
  saleCode?: string;
};

type DashboardSummaryRow = {
  filteredSales: number | string;
  total: number | string;
};

type DashboardPaymentRow = {
  type: PaymentMethod;
  amount: number | string;
};

@Injectable()
export class SalesDashboardService {
  constructor(private readonly dataSource: DataSource) {}

  async getDashboard(
    query: SalesDashboardQueryDto,
    companyUid: string,
  ): Promise<SalesDashboardResponse> {
    if (!companyUid) {
      throw new BadRequestException('Empresa não identificada');
    }

    const period = normalizeSalesDashboardDateRange(query?.from, query?.to);
    const paymentTypes = normalizeList(query?.paymentType);
    const saleTypes = normalizeList(query?.saleType);
    const customerName = normalizeText(query?.customerName);
    const saleCode = normalizeText(query?.saleCode);

    const params: DashboardParams = {
      companyUid,
      status: SaleStatus.COMPLETED,
      fromDate: toTimestampUTC(period.fromDate),
      toDate: toTimestampUTC(period.toExclusiveDate),
      paymentTypes,
      saleTypes,
      ...(customerName ? { customerName } : {}),
      ...(saleCode ? { saleCode } : {}),
    };

    const eligibleSales = this.eligibleSalesQuery(params);
    const paymentsPerSale = this.paymentsPerSaleQuery(params, eligibleSales);

    const summary = await this.getSummary(
      params,
      eligibleSales,
      paymentsPerSale,
    );
    const paymentBreakdown = await this.getPaymentBreakdown(
      params,
      eligibleSales,
      paymentsPerSale,
    );

    return {
      period: { from: period.from, to: period.to },
      filters: {
        paymentType: paymentTypes,
        saleType: saleTypes,
        customerName: customerName ?? null,
        saleCode: saleCode ?? null,
      },
      summary: {
        filteredSales: toNumber(summary.filteredSales),
        total: toNumber(summary.total),
      },
      paymentBreakdown,
    };
  }

  private eligibleSalesQuery(
    params: DashboardParams,
  ): SelectQueryBuilder<unknown> {
    const qb = this.dataSource
      .createQueryBuilder()
      .select('s.id', 'saleId')
      .addSelect('s."change"', 'change')
      .from('sales', 's')
      .where('s."companyUid" = :companyUid', {
        companyUid: params.companyUid,
      })
      .andWhere('s.status = :status', { status: params.status })
      .andWhere('s."deletedAt" IS NULL')
      .andWhere('s."createdAt" >= :fromDate', { fromDate: params.fromDate })
      .andWhere('s."createdAt" < :toDate', { toDate: params.toDate });

    if (params.saleTypes.length > 0) {
      qb.andWhere('s.type IN (:...saleTypes)', {
        saleTypes: params.saleTypes,
      });
    }

    if (params.customerName) {
      qb.innerJoin(
        'intern_customers',
        'ic',
        'ic.id = s."internCustomerId" AND ic."deletedAt" IS NULL',
      );
      qb.andWhere('ic.name ILIKE :customerName', {
        customerName: `%${params.customerName}%`,
      });
    }

    if (params.saleCode) {
      qb.andWhere('s.code ILIKE :saleCode', {
        saleCode: `%${params.saleCode}%`,
      });
    }

    if (params.paymentTypes.length > 0) {
      qb.andWhere(
        `EXISTS (
          SELECT 1
          FROM sale_payments sp_filter
          WHERE sp_filter."saleId" = s.id
            AND sp_filter."deletedAt" IS NULL
            AND sp_filter.type IN (:...paymentTypes)
        )`,
        { paymentTypes: params.paymentTypes },
      );
    }

    return qb;
  }

  private paymentsPerSaleQuery(
    params: DashboardParams,
    eligibleSales: SelectQueryBuilder<unknown>,
  ): SelectQueryBuilder<unknown> {
    return this.dataSource
      .createQueryBuilder()
      .select('eligible."saleId"', 'saleId')
      .addSelect('sp.type', 'type')
      .addSelect('SUM(sp.amount)', 'amount')
      .addSelect('COALESCE(eligible."change", 0)', 'change')
      .from(`(${eligibleSales.getQuery()})`, 'eligible')
      .innerJoin(
        'sale_payments',
        'sp',
        this.paymentJoinCondition(params),
        params,
      )
      .groupBy('eligible."saleId"')
      .addGroupBy('sp.type')
      .addGroupBy('eligible."change"');
  }

  private async getSummary(
    params: DashboardParams,
    eligibleSales: SelectQueryBuilder<unknown>,
    paymentsPerSale: SelectQueryBuilder<unknown>,
  ): Promise<DashboardSummaryRow> {
    const result = await this.dataSource
      .createQueryBuilder()
      .select('COUNT(DISTINCT eligible."saleId")', 'filteredSales')
      .addSelect(
        `COALESCE((SELECT SUM(${cashAmountExpression('ps')})
          FROM (${paymentsPerSale.getQuery()}) ps), 0)`,
        'total',
      )
      .from(`(${eligibleSales.getQuery()})`, 'eligible')
      .setParameters({
        ...eligibleSales.getParameters(),
        ...paymentsPerSale.getParameters(),
        cashType: PaymentMethod.CASH,
      })
      .getRawOne<DashboardSummaryRow>();

    return result ?? { filteredSales: 0, total: 0 };
  }

  private async getPaymentBreakdown(
    params: DashboardParams,
    eligibleSales: SelectQueryBuilder<unknown>,
    paymentsPerSale: SelectQueryBuilder<unknown>,
  ): Promise<SalesDashboardPaymentAggregate[]> {
    const rows = await this.dataSource
      .createQueryBuilder()
      .select('ps."type"', 'type')
      .addSelect(`SUM(${cashAmountExpression('ps')})`, 'amount')
      .from(`(${paymentsPerSale.getQuery()})`, 'ps')
      .groupBy('ps."type"')
      .orderBy('ps."type"', 'ASC')
      .setParameters({
        ...eligibleSales.getParameters(),
        ...paymentsPerSale.getParameters(),
        cashType: PaymentMethod.CASH,
      })
      .getRawMany<DashboardPaymentRow>();

    return rows.map((row) => ({
      type: row.type,
      amount: toNumber(row.amount),
    }));
  }

  private paymentJoinCondition(params: DashboardParams): string {
    const conditions = [
      'sp."saleId" = eligible."saleId"',
      'sp."deletedAt" IS NULL',
    ];
    if (params.paymentTypes.length > 0) {
      conditions.push('sp.type IN (:...paymentTypes)');
    }
    return conditions.join(' AND ');
  }
}

function cashAmountExpression(alias: string): string {
  return `CASE WHEN ${alias}."type" = :cashType THEN GREATEST(${alias}.amount - ${alias}."change", 0) ELSE ${alias}.amount END`;
}

function normalizeList<T>(value: T[] | undefined): T[] {
  return value ? [...new Set(value)] : [];
}

function normalizeText(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized || undefined;
}

function toNumber(value: number | string): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function toTimestampUTC(date: Date): string {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
}
