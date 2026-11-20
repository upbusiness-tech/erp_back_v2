/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { toTimestampUTC } from 'src/common/date';
import { QueryStatisticPeriodDto } from '../common/dto/queryStatisticPeriod.dto';
import { QueryStatisticLimitDto } from '../common/dto/queryStatisticLimit.dto';
import { normalizeStatisticDateRange } from '../common/statistic.functions';
import { StatisticRepositoryParams } from '../common/statistic.types';
import { StatisticStockRepository } from './statisticStock.repository';
import type {
  StatisticStockAlertsAndOpportunitiesRow,
  StatisticStockDistributionByCategoryRow,
  StatisticStockHistoryOverviewResponse,
  StatisticStockHealthOverviewResponse,
  StatisticStockInOutResponse,
  StatisticStockInOutRow,
  StatisticStockRankingResponse,
  StatisticStockStatusByEspecificationRow,
  StatisticStockStatusRow,
  StatisticStockTopSellingProductsRow,
} from './statisticStock.interfaces';

const toNumber = (value: string | null | undefined): number =>
  Number(value ?? 0);

function mapInOut(row: StatisticStockInOutRow): StatisticStockInOutResponse {
  return {
    entries: toNumber(row.productEntry),
    exits: toNumber(row.productExit),
    movedUnits: toNumber(row.productMoviments),
    balance: toNumber(row.periodBalance),
    entriesSubtitleValue: toNumber(row.productEntryBalance),
    exitsSubtitleValue: toNumber(row.productExitSaleBalance),
  };
}

function mapRanking(
  row: StatisticStockTopSellingProductsRow,
): StatisticStockRankingResponse {
  return {
    name: row.name,
    size: row.size,
    color: row.color,
    brand: row.brand,
    unitOfMeasure: row.unitOfMeasure,
    quantitySold: toNumber(row.quantitySold),
    salesAmount: toNumber(row.salesAmount),
    salesProfitAmount: toNumber(row.salesProfitAmount),
  };
}

@Injectable()
export class StatisticStockService {
  constructor(
    private readonly statisticStockRepository: StatisticStockRepository,
  ) {}

  /**
   * Estatísticas parametrizadas por data:
   * - Entradas e saídas de produtos
   * - Produtos mais vendidos (DESC) e menos vendidos (ASC)
   * - Maior lucro (revenueProducts)
   */
  async getHistoryOverviewWithRangeDate(
    companyUid: string,
    query: QueryStatisticPeriodDto,
  ): Promise<StatisticStockHistoryOverviewResponse> {
    try {
      const period = normalizeStatisticDateRange(query?.from, query?.to);
      const params: StatisticRepositoryParams = {
        companyUid,
        fromDate: toTimestampUTC(period.fromDate),
        toDate: toTimestampUTC(period.toExclusiveDate),
        limit: query.limit,
      };

      const inOut = await this.statisticStockRepository.getInOut(params);
      const topSelling =
        await this.statisticStockRepository.getTopOrUntopSellingProducts(
          params,
          'DESC',
        );
      const untopSelling =
        await this.statisticStockRepository.getTopOrUntopSellingProducts(
          params,
          'ASC',
        );
      const revenueProducts =
        await this.statisticStockRepository.getRevenueProducts(params);

      return {
        inOut: mapInOut(inOut),
        topSelling: topSelling.map(mapRanking),
        untopSelling: untopSelling.map(mapRanking),
        revenueProducts: revenueProducts.map(mapRanking),
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Saúde do estoque (dados atuais, não parametrizados por data):
   * - Alertas (abaixo do mínimo, acima do máximo, esgotados, sem fornecedor)
   * - Distribuição por categoria (com quantidade em estoque)
   * - Rankings de maior estoque (produtos e variações)
   */
  async getHealthOverview(
    companyUid: string,
    query: QueryStatisticLimitDto,
  ): Promise<StatisticStockHealthOverviewResponse> {
    try {
      const alerts: StatisticStockAlertsAndOpportunitiesRow =
        await this.statisticStockRepository.getAlertsAndOpportunities(
          companyUid,
        );

      const distributionByCategory: StatisticStockDistributionByCategoryRow[] =
        await this.statisticStockRepository.getDistributionByCategory(
          companyUid,
        );

      const stockQuantityStatus: StatisticStockStatusRow[] =
        await this.statisticStockRepository.getStockStatus(companyUid, query);

      const stockQuantityStatusByEspecification: StatisticStockStatusByEspecificationRow[] =
        await this.statisticStockRepository.getStockStatusByEspecification(
          companyUid,
          query,
        );

      return {
        alerts: {
          underMinStock: toNumber(alerts.underMinStock),
          overMaxStock: toNumber(alerts.overMaxStock),
          soldOutTotal: toNumber(alerts.soldOutTotal),
          noSupplierInformed: toNumber(alerts.noSupplierInformed),
        },
        categoryDistribution: distributionByCategory.map((category) => ({
          id: category.id,
          name: category.name,
          amountCategory: toNumber(category.amountCategory),
          stockQuantity: toNumber(category.stockQuantity),
        })),
        highestStock: stockQuantityStatus.map((row) => ({
          name: row.name,
          stockQuantity: toNumber(row.stockQuantity),
          unitOfMeasure: row.unitOfMeasure,
        })),
        highestStockVariations: stockQuantityStatusByEspecification.map(
          (row) => ({
            name: row.name,
            size: row.size,
            color: row.color,
            brand: row.brand,
            unitOfMeasure: row.unitOfMeasure,
            stockQuantity: toNumber(row.stockQuantity),
          }),
        ),
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
