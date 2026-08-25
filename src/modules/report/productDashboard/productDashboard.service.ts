import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SaleStatus } from 'src/modules/sale/sale.enum';
import { PRODUCT_DASHBOARD_RESTOCK_THRESHOLD } from './productDashboard.constants';
import type { ProductDashboardQueryDto } from './dto/productDashboardQuery.dto';
import {
  normalizeProductDashboardDateRange,
  normalizeProductDashboardLimit,
} from './productDashboard.utils';
import type {
  ProductDashboardEntry,
  ProductDashboardResponse,
} from './productDashboard.types';

type DashboardAggregateRow = {
  productId: number | string;
  productName: string;
  quantitySold: number | string;
  revenue: number | string;
  stockQuantity: number | string;
  turnover: number | string;
};

type DashboardSummaryRow = {
  unitsSold: number | string;
  revenue: number | string;
  zeroStockProducts: number | string;
};

type DashboardParams = Record<string, unknown>;

@Injectable()
export class ProductDashboardService {
  constructor(private readonly dataSource: DataSource) {}

  async getDashboard(
    query: ProductDashboardQueryDto,
    companyUid: string,
  ): Promise<ProductDashboardResponse> {
    if (!companyUid) {
      throw new BadRequestException('Empresa não identificada');
    }

    const period = normalizeProductDashboardDateRange(query?.from, query?.to);
    const limit = normalizeProductDashboardLimit(query?.limit);

    const params: DashboardParams = {
      companyUid,
      status: SaleStatus.COMPLETED,
      fromDate: toTimestampUTC(period.fromDate),
      toDate: toTimestampUTC(period.toExclusiveDate),
      threshold: PRODUCT_DASHBOARD_RESTOCK_THRESHOLD,
      limit,
    };

    const summary = await this.getSummary(params);
    const bestSelling = await this.getRanking('quantity', params);
    const highestRevenue = await this.getRanking('revenue', params);
    const highestTurnover = await this.getRanking('turnover', params);
    const urgentRestock = await this.getUrgentRestock(params);

    return {
      period: { from: period.from, to: period.to },
      summary: {
        unitsSold: toNumber(summary.unitsSold),
        revenue: toNumber(summary.revenue),
        featuredProduct: bestSelling[0] ?? null,
        zeroStockProducts: toNumber(summary.zeroStockProducts),
      },
      rankings: {
        bestSelling,
        highestRevenue,
        highestTurnover,
        urgentRestock,
      },
    };
  }

  private productStockQuery(params: DashboardParams) {
    return this.dataSource
      .createQueryBuilder()
      .select('pe.productId', 'productId')
      .addSelect('COALESCE(SUM(pe.stockQuantity), 0)', 'stockQuantity')
      .from('product_especifications', 'pe')
      .innerJoin('products', 'p', 'p.id = pe.productId')
      .where('p.companyUid = :companyUid', { companyUid: params.companyUid })
      .andWhere('p.deletedAt IS NULL')
      .andWhere('pe.deletedAt IS NULL')
      .groupBy('pe.productId');
  }

  private eligibleSalesBase(params: DashboardParams) {
    return this.dataSource
      .createQueryBuilder()
      .from('sales_items', 'si')
      .innerJoin('sales', 's', 's.id = si.saleId')
      .where('s.companyUid = :companyUid', { companyUid: params.companyUid })
      .andWhere('s.status = :status', { status: params.status })
      .andWhere('s.deletedAt IS NULL')
      .andWhere('si.deletedAt IS NULL')
      .andWhere('s.createdAt >= :fromDate', { fromDate: params.fromDate })
      .andWhere('s.createdAt < :toDate', { toDate: params.toDate });
  }

  private async getSummary(
    params: DashboardParams,
  ): Promise<DashboardSummaryRow> {
    const periodProducts = this.eligibleSalesBase(params).select(
      'DISTINCT si.productId',
      'productId',
    );

    const productStock = this.productStockQuery(params);

    const zeroStockCount = this.dataSource
      .createQueryBuilder()
      .select('COUNT(*)', 'count')
      .from(`(${periodProducts.getQuery()})`, 'pp')
      .leftJoin(
        `(${productStock.getQuery()})`,
        'ps',
        'ps."productId" = pp."productId"',
      )
      .where('COALESCE(ps."stockQuantity", 0) <= :threshold', {
        threshold: params.threshold,
      });

    const allParams = {
      ...periodProducts.getParameters(),
      ...productStock.getParameters(),
      ...zeroStockCount.getParameters(),
    };

    const result = await this.eligibleSalesBase(params)
      .select('COALESCE(SUM(si.quantitySold * si."unitSold"), 0)', 'unitsSold')
      .addSelect(
        'COALESCE(SUM(si.quantitySold * si."unitSold" * (COALESCE(si.specialPriceSnapshot, si.salePriceSnapshot) - COALESCE(si.costPriceSnapshot, 0))), 0)',
        'revenue',
      )
      .addSelect(`(${zeroStockCount.getQuery()})`, 'zeroStockProducts')
      .innerJoin('products', 'p', 'p.id = si.productId')
      .andWhere('p.companyUid = :companyUid', {
        companyUid: params.companyUid,
      })
      .andWhere('p.deletedAt IS NULL')
      .setParameters(allParams)
      .getRawOne<DashboardSummaryRow>();

    return (
      result ?? {
        unitsSold: 0,
        revenue: 0,
        zeroStockProducts: 0,
      }
    );
  }

  private async getRanking(
    orderBy: 'quantity' | 'revenue' | 'turnover',
    params: DashboardParams,
  ): Promise<ProductDashboardEntry[]> {
    const productStock = this.productStockQuery(params);

    const orderSpec: Record<string, [string, 'DESC' | 'ASC'][]> = {
      quantity: [
        ['quantitySold', 'DESC'],
        ['revenue', 'DESC'],
      ],
      revenue: [
        ['revenue', 'DESC'],
        ['quantitySold', 'DESC'],
      ],
      turnover: [
        ['turnover', 'DESC'],
        ['quantitySold', 'DESC'],
      ],
    };

    const qb = this.eligibleSalesBase(params)
      .select('p.id', 'productId')
      .addSelect('p.name', 'productName')
      .addSelect('SUM(si.quantitySold * si."unitSold")', 'quantitySold')
      .addSelect(
        'SUM(si.quantitySold * si."unitSold" * (COALESCE(si.specialPriceSnapshot, si.salePriceSnapshot) - COALESCE(si.costPriceSnapshot, 0)))',
        'revenue',
      )
      .addSelect('COALESCE(ps."stockQuantity", 0)', 'stockQuantity')
      .addSelect(
        'SUM(si.quantitySold * si."unitSold") / GREATEST(COALESCE(ps."stockQuantity", 0), 1)',
        'turnover',
      )
      .innerJoin('products', 'p', 'p.id = si.productId')
      .leftJoin(`(${productStock.getQuery()})`, 'ps', 'ps."productId" = p.id')
      .andWhere('p.companyUid = :companyUid', {
        companyUid: params.companyUid,
      })
      .andWhere('p.deletedAt IS NULL')
      .groupBy('p.id')
      .addGroupBy('p.name')
      .addGroupBy('ps."stockQuantity"')
      .limit(params.limit as number)
      .setParameters(productStock.getParameters());

    for (const [column, direction] of orderSpec[orderBy]) {
      qb.addOrderBy(column, direction);
    }
    qb.addOrderBy('p.id', 'ASC');

    const rows = await qb.getRawMany<DashboardAggregateRow>();
    return rows.map(toDashboardEntry);
  }

  private async getUrgentRestock(
    params: DashboardParams,
  ): Promise<ProductDashboardEntry[]> {
    const periodMetrics = this.eligibleSalesBase(params)
      .select('si.productId', 'productId')
      .addSelect('SUM(si.quantitySold * si."unitSold")', 'quantitySold')
      .addSelect(
        'SUM(si.quantitySold * si."unitSold" * (COALESCE(si.specialPriceSnapshot, si.salePriceSnapshot) - COALESCE(si.costPriceSnapshot, 0)))',
        'revenue',
      )
      .groupBy('si.productId');

    const productStock = this.productStockQuery(params);

    const allParams = {
      ...periodMetrics.getParameters(),
      ...productStock.getParameters(),
      ...params,
    };

    const rows = await this.dataSource
      .createQueryBuilder()
      .select('p.id', 'productId')
      .addSelect('p.name', 'productName')
      .addSelect('"pm"."quantitySold"', 'quantitySold')
      .addSelect('"pm"."revenue"', 'revenue')
      .addSelect('COALESCE(ps."stockQuantity", 0)', 'stockQuantity')
      .addSelect(
        '"pm"."quantitySold" / GREATEST(COALESCE(ps."stockQuantity", 0), 1)',
        'turnover',
      )
      .from(`(${periodMetrics.getQuery()})`, 'pm')
      .innerJoin('products', 'p', 'p.id = pm."productId"')
      .leftJoin(`(${productStock.getQuery()})`, 'ps', 'ps."productId" = p.id')
      .where('p.companyUid = :companyUid', {
        companyUid: params.companyUid,
      })
      .andWhere('p.deletedAt IS NULL')
      .andWhere('COALESCE(ps."stockQuantity", 0) <= :threshold', {
        threshold: params.threshold,
      })
      .orderBy('stockQuantity', 'ASC')
      .addOrderBy('quantitySold', 'DESC')
      .addOrderBy('p.id', 'ASC')
      .limit(params.limit as number)
      .setParameters(allParams)
      .getRawMany<DashboardAggregateRow>();

    return rows.map(toDashboardEntry);
  }
}

function toDashboardEntry(row: DashboardAggregateRow): ProductDashboardEntry {
  return {
    productId: Number(row.productId),
    productName: row.productName,
    quantitySold: toNumber(row.quantitySold),
    revenue: toNumber(row.revenue),
    stockQuantity: toNumber(row.stockQuantity),
    turnover: toNumber(row.turnover),
  };
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
