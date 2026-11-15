/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { toTimestampUTC } from 'src/common/date';
import { QueryStatisticPeriodDto } from '../common/dto/queryStatisticPeriod.dto';
import { normalizeStatisticDateRange } from '../common/statistic.functions';
import { StatisticRepositoryParams } from '../common/statistic.types';
import { StatisticSaleRepository } from './statisticSale.repository';
import {
  ESaleDateGroup,
  type StatisticSaleHistoryOverviewResponse,
  type StatisticSaleRevenueOverviewRow,
  type StatisticSaleStatsByDayOfWeekRow,
} from './statisticSale.interfaces';

const toNumber = (value: string | null | undefined): number =>
  Number(value ?? 0);

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const WEEKDAY_COLUMNS = [
  'dom',
  'seg',
  'ter',
  'qua',
  'qui',
  'sex',
  'sab',
] as const;

function resolveDateGroup(
  fromDate: Date,
  toExclusiveDate: Date,
): ESaleDateGroup {
  const rangeDays = Math.ceil(
    (toExclusiveDate.getTime() - fromDate.getTime()) / (24 * 60 * 60 * 1000),
  );
  if (rangeDays <= 1) return ESaleDateGroup.HOUR;
  if (rangeDays <= 31) return ESaleDateGroup.DAY;
  return ESaleDateGroup.WEEK;
}

function mapOverview(row: StatisticSaleRevenueOverviewRow) {
  return {
    salesTotal: toNumber(row.salesTotal),
    grossRevenue: toNumber(row.grossRevenue),
    profitRevenue: toNumber(row.profitRevenue),
    averageTicket: toNumber(row.averageTicket),
  };
}

function mapWeekdayRevenue(rows: StatisticSaleStatsByDayOfWeekRow[]) {
  const faturamento = rows.find((row) => row.metric === 'Faturamento Bruto');
  return WEEKDAY_COLUMNS.map((column, index) => ({
    weekday: index,
    label: WEEKDAY_LABELS[index],
    revenue: toNumber(faturamento?.[column]),
  }));
}

@Injectable()
export class StatisticSaleService {
  constructor(
    private readonly statisticSaleRepository: StatisticSaleRepository,
  ) {}

  async getHistoryOverviewWithRangeDate(
    companyUid: string,
    query: QueryStatisticPeriodDto,
  ): Promise<StatisticSaleHistoryOverviewResponse> {
    try {
      const period = normalizeStatisticDateRange(query?.from, query?.to);
      const params: StatisticRepositoryParams = {
        companyUid,
        fromDate: toTimestampUTC(period.fromDate),
        toDate: toTimestampUTC(period.toExclusiveDate),
      };

      const overview =
        await this.statisticSaleRepository.getRevenueOverview(params);
      const paymentDistribution =
        await this.statisticSaleRepository.getPaymentDistribution(params);
      const timeline =
        await this.statisticSaleRepository.getRevenueGroupedByDate(
          params,
          resolveDateGroup(period.fromDate, period.toExclusiveDate),
        );
      const statsByDayOfWeek =
        await this.statisticSaleRepository.getStatsByDayOfWeek(params);

      return {
        overview: mapOverview(overview),
        paymentDistribution: paymentDistribution.map((row) => ({
          type: row.type,
          amountPaid: toNumber(row.amountPaid),
        })),
        timeline: timeline.map((row) => ({
          saleDate: new Date(row.saleDate).toISOString(),
          saleQuantity: toNumber(row.saleQuantity),
          grossRevenue: toNumber(row.grossRevenue),
          profitRevenue: toNumber(row.profitRevenue),
        })),
        weekdayRevenue: mapWeekdayRevenue(statsByDayOfWeek),
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
