import { BadRequestException, Injectable } from '@nestjs/common';
import { SaleStatus } from 'src/modules/sale/sale.enum';
import { DataSource } from 'typeorm';
import { normalizeProductDashboardDateRange } from '../consts/productDashboard.utils';

type TopSellingCategoriesParams = Record<string, unknown>;

type CategoryAggRow = {
  categoryId: number | string;
  categoryName: string;
  categoryColor: string;
  unitsSold: number | string;
  revenue: number | string;
};

type TotalRow = {
  totalUnits: number | string;
};

@Injectable()
export class TopSellingCategoriesService {
  constructor(private readonly dataSource: DataSource) {}

  async getTopSellingCategories(
    from: string,
    to: string,
    companyUid: string,
    limit: number = 10,
  ): Promise<
    {
      categoryId: number;
      categoryName: string;
      categoryColor: string;
      unitsSold: number;
      revenue: number;
      percentage: number;
    }[]
  > {
    if (!companyUid) {
      throw new BadRequestException('Empresa não identificada');
    }

    const period = normalizeProductDashboardDateRange(from, to);

    const params: TopSellingCategoriesParams = {
      companyUid,
      status: SaleStatus.COMPLETED,
      fromDate: toTimestampUTC(period.fromDate),
      toDate: toTimestampUTC(period.toExclusiveDate),
      limit,
    };

    const totalRow = await this.dataSource
      .createQueryBuilder()
      .select(
        'COALESCE(SUM(si."unitSold" * si."quantitySold"), 0)',
        'totalUnits',
      )
      .from('sales_items', 'si')
      .innerJoin('sales', 's', 's.id = si."saleId"')
      .innerJoin('products', 'p', 'p.id = si."productId"')
      .where('p.companyUid = :companyUid', { companyUid })
      .andWhere('s.status = :status', { status: params.status })
      .andWhere('s."deletedAt" IS NULL')
      .andWhere('si."deletedAt" IS NULL')
      .andWhere('s."createdAt" >= :fromDate', { fromDate: params.fromDate })
      .andWhere('s."createdAt" < :toDate', { toDate: params.toDate })
      .setParameters(params)
      .getRawOne<TotalRow>();

    const totalUnits = toNumber(totalRow?.totalUnits ?? 0);

    const rows = await this.dataSource
      .createQueryBuilder()
      .select('pc.id', 'categoryId')
      .addSelect('pc.name', 'categoryName')
      .addSelect('pc.color', 'categoryColor')
      .addSelect(
        'COALESCE(SUM(si."unitSold" * si."quantitySold"), 0)',
        'unitsSold',
      )
      .addSelect(
        'COALESCE(SUM(si."quantitySold" * si."unitSold" * (COALESCE(si."specialPriceSnapshot", si."salePriceSnapshot") - COALESCE(si."costPriceSnapshot", 0))), 0)',
        'revenue',
      )
      .from('sales_items', 'si')
      .innerJoin('sales', 's', 's.id = si."saleId"')
      .innerJoin('products', 'p', 'p.id = si."productId"')
      .innerJoin('product_categories', 'pc', 'pc.id = p."productCategoryId"')
      .where('p.companyUid = :companyUid', { companyUid })
      .andWhere('s.status = :status', { status: params.status })
      .andWhere('s."deletedAt" IS NULL')
      .andWhere('si."deletedAt" IS NULL')
      .andWhere('s."createdAt" >= :fromDate', { fromDate: params.fromDate })
      .andWhere('s."createdAt" < :toDate', { toDate: params.toDate })
      .andWhere('pc."deletedAt" IS NULL')
      .groupBy('pc.id')
      .addGroupBy('pc.name')
      .addGroupBy('pc.color')
      .orderBy('SUM(si."unitSold" * si."quantitySold")', 'DESC')
      .addOrderBy('pc.id', 'ASC')
      .limit(limit)
      .setParameters(params)
      .getRawMany<CategoryAggRow>();

    return rows.map((row) => {
      const units = toNumber(row.unitsSold);
      return {
        categoryId: Number(row.categoryId),
        categoryName: row.categoryName,
        categoryColor: row.categoryColor,
        unitsSold: units,
        revenue: toNumber(row.revenue),
        percentage: totalUnits > 0 ? round((units / totalUnits) * 100) : 0,
      };
    });
  }
}

function toNumber(value: number | string): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function toTimestampUTC(date: Date): string {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
}
