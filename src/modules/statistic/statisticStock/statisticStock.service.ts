/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { toTimestampUTC } from 'src/common/date';
import { QueryStatisticPeriodDto } from '../common/dto/queryStatisticPeriod.dto';
import { normalizeStatisticDateRange } from '../common/statistic.functions';
import { StatisticRepositoryParams } from '../common/statistic.types';
import { StatisticStockRepository } from './statisticStock.repository';

@Injectable()
export class StatisticStockService {
  constructor(
    private readonly statisticStockRepository: StatisticStockRepository,
  ) {}

  /**
   * Aqui serão retornados dados de estatísticas que são parametrizadas por datas
   * - Entradas e saídas de produtos
   * - Produtos mais vendidos
   * - Produtos menos vendidos
   * - Maior faturamento
   */
  async getHistoryOverviewWithRangeDate(
    companyUid: string,
    query: QueryStatisticPeriodDto,
  ) {
    try {
      const period = normalizeStatisticDateRange(query?.from, query?.to);
      const params: StatisticRepositoryParams = {
        companyUid,
        fromDate: toTimestampUTC(period.fromDate),
        toDate: toTimestampUTC(period.toExclusiveDate),
      };

      const inOut = await this.statisticStockRepository.getInOut(params);
      const topSelling =
        await this.statisticStockRepository.getTopOrUntopSellingProducts(
          params,
        );
      const untopSelling =
        await this.statisticStockRepository.getTopOrUntopSellingProducts(
          params,
        );

      const revenueProducts =
        await this.statisticStockRepository.getRevenueProducts(params);

      return {
        ...inOut,
        ...topSelling,
        ...untopSelling,
        ...revenueProducts,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Aqui retorna dados de saúde do estoque, não são parametrizados por datas,
   * retornam sempre os dados mais de tempo real do estoque
   * - Dados de alertas e oportunidades que incluem:
   *  - Abaixo do estoque mínimo
   *  - Acima do estoque máximo
   *  - Esgotados
   *  - Sem fornecedor informado
   * - Distribuição de produtos por categoria
   * - Rankings de:
   * - Maior estoque
   * - Menor estoque
   */
  async getHealthOverview(companyUid: string, query: QueryStatisticPeriodDto) {
    try {
      const alertsAndOpportunities =
        await this.statisticStockRepository.getAlertsAndOpportunities(
          companyUid,
        );

      const distributionByCategory =
        await this.statisticStockRepository.getDistributionByCategory(
          companyUid,
        );

      const stockQuantityStatus =
        await this.statisticStockRepository.getStockStatus(companyUid, query);

      const stockQuantityStatusByEspecification =
        await this.statisticStockRepository.getStockStatusByEspecification(
          companyUid,
          query,
        );

      return {
        ...alertsAndOpportunities,
        ...distributionByCategory,
        ...stockQuantityStatus,
        ...stockQuantityStatusByEspecification,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
