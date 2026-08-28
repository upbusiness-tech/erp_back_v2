import { BadRequestException, Injectable } from '@nestjs/common';
import { SaleStatus } from 'src/modules/sale/sale.enum';
import { DataSource } from 'typeorm';
import { normalizeProductDashboardDateRange } from '../consts/productDashboard.utils';

type ProductOverviewStatsParams = Record<string, unknown>;

type ProductOverviewStatsRow = {
  netProfit: number | string;
  grossProfit: number | string;
  unitsSold: number | string;
};

@Injectable()
export class ProductOverviewStatsService {
  constructor(private readonly dataSource: DataSource) {}

  async getOverviewStats(
    productId: number,
    from: string,
    to: string,
    companyUid: string,
  ): Promise<{
    netProfit: number;
    grossProfit: number;
    unitsSold: number;
  }> {
    if (!companyUid) {
      throw new BadRequestException('Empresa não identificada');
    }

    if (!productId) {
      throw new BadRequestException('ProductId é obrigatório');
    }

    const period = normalizeProductDashboardDateRange(from, to);

    const params: ProductOverviewStatsParams = {
      companyUid,
      productId,
      status: SaleStatus.COMPLETED,
      fromDate: toTimestampUTC(period.fromDate),
      toDate: toTimestampUTC(period.toExclusiveDate),
    };

    const result = await this.dataSource
      .createQueryBuilder()
      .select('COALESCE(SUM(si."amountItem"), 0)', 'netProfit')
      .addSelect('COALESCE(SUM(si."amountProfitItem"), 0)', 'grossProfit')
      .addSelect(
        'COALESCE(SUM(si."quantitySold" * si."unitSold"), 0)',
        'unitsSold',
      )
      .from('sales_items', 'si')
      .innerJoin('sales', 's', 's.id = si."saleId"')
      .innerJoin('products', 'p', 'p.id = si."productId"')
      .where('p.companyUid = :companyUid', { companyUid })
      .andWhere('p.id = :productId', { productId })
      .andWhere('s.status = :status', { status: params.status })
      .andWhere('s."deletedAt" IS NULL')
      .andWhere('si."deletedAt" IS NULL')
      .andWhere('s."createdAt" >= :fromDate', { fromDate: params.fromDate })
      .andWhere('s."createdAt" < :toDate', { toDate: params.toDate })
      .setParameters(params)
      .getRawOne<ProductOverviewStatsRow>();

    return {
      netProfit: toNumber(result?.netProfit ?? 0),
      grossProfit: toNumber(result?.grossProfit ?? 0),
      unitsSold: toNumber(result?.unitsSold ?? 0),
    };
  }
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
