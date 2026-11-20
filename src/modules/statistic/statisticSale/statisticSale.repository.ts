import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SaleEntity } from 'src/modules/sale/sale.entity';
import { SaleStatus } from 'src/modules/sale/sale.enum';
import { Repository } from 'typeorm';
import { StatisticRepositoryParams } from '../common/statistic.types';
import {
  ESaleDateGroup,
  StatisticSalePaymentDistributionRow,
  StatisticSaleRevenueGroupedByDateRow,
  StatisticSaleRevenueOverviewRow,
  StatisticSaleStatsByDayOfWeekRow,
} from './statisticSale.interfaces';
@Injectable()
export class StatisticSaleRepository {
  constructor(
    @InjectRepository(SaleEntity)
    private readonly saleRepo: Repository<SaleEntity>,
  ) {}

  /**
   * Retorna, parametrizados por data, os seguintes dados:
   * - Lucro bruto
   * - Lucro líquido
   * - Total de vendas
   * - Ticket medio
   */
  async getRevenueOverview(params: StatisticRepositoryParams) {
    return await this.saleRepo
      .createQueryBuilder('s')
      .select('count(s.*)', 'salesTotal')
      .addSelect('sum(s."total")', 'grossRevenue')
      .addSelect('sum(s."amountProfit")', 'profitRevenue')
      .addSelect('sum(s."total") / count(s.*)::numeric', 'averageTicket')
      .where('s."status" = :status', { status: SaleStatus.COMPLETED })
      .andWhere('s."companyUid" = :companyUid', {
        companyUid: params.companyUid,
      })
      .andWhere('s."createdAt" >= :fromDate', { fromDate: params.fromDate })
      .andWhere('s."createdAt" < :toDate', { toDate: params.toDate })
      .getRawOne<StatisticSaleRevenueOverviewRow>();
  }

  async getPaymentDistribution(params: StatisticRepositoryParams) {
    return await this.saleRepo
      .createQueryBuilder('s')
      .select('sp."type"', 'type')
      .addSelect('sum(sp."amount")', 'amountPaid')
      .innerJoin('sale_payments', 'sp', 'sp."saleId" = s.id')
      .where('s."status" = :status', { status: SaleStatus.COMPLETED })
      .andWhere('s."companyUid" = :companyUid', {
        companyUid: params.companyUid,
      })
      .andWhere('s."createdAt" >= :fromDate', { fromDate: params.fromDate })
      .andWhere('s."createdAt" < :toDate', { toDate: params.toDate })
      .groupBy('sp."type"')
      .getRawMany<StatisticSalePaymentDistributionRow>();
  }

  async getRevenueGroupedByDate(
    params: StatisticRepositoryParams,
    groupBy: ESaleDateGroup = ESaleDateGroup.HOUR,
  ) {
    return await this.saleRepo
      .createQueryBuilder('s')
      .select('date_trunc(:groupBy, s."createdAt")', 'saleDate')
      .addSelect('count(s.*)', 'saleQuantity')
      .addSelect('sum(s."total")', 'grossRevenue')
      .addSelect('sum(s."amountProfit")', 'profitRevenue')
      .where('s."status" = :status', { status: SaleStatus.COMPLETED })
      .andWhere('s."companyUid" = :companyUid', {
        companyUid: params.companyUid,
      })
      .andWhere('s."createdAt" >= :fromDate', { fromDate: params.fromDate })
      .andWhere('s."createdAt" < :toDate', { toDate: params.toDate })
      .groupBy('date_trunc(:groupBy, s."createdAt")')
      .orderBy('"saleDate"', 'ASC')
      .setParameter('groupBy', groupBy)
      .getRawMany<StatisticSaleRevenueGroupedByDateRow>();
  }

  async getStatsByDayOfWeek(params: StatisticRepositoryParams) {
    const weekdaySum = (weekday: number) => `
      coalesce(
        sum(
          case
            when m.metric = 'Faturamento Bruto' then s."total"
            when m.metric = 'Lucro' then s."amountProfit"
            else 1
          end
        ) filter (where extract(dow from s."createdAt") = ${weekday}),
        0
      )
    `;

    return await this.saleRepo
      .createQueryBuilder('s')
      .select('m.metric', 'metric')
      .addSelect(weekdaySum(0), 'dom')
      .addSelect(weekdaySum(1), 'seg')
      .addSelect(weekdaySum(2), 'ter')
      .addSelect(weekdaySum(3), 'qua')
      .addSelect(weekdaySum(4), 'qui')
      .addSelect(weekdaySum(5), 'sex')
      .addSelect(weekdaySum(6), 'sab')
      .innerJoin(
        `(select 'Faturamento Bruto' as metric
          union all select 'Lucro' as metric
          union all select 'Qtd Vendas' as metric)`,
        'm',
        'true',
      )
      .where('s."status" = :status', { status: SaleStatus.COMPLETED })
      .andWhere('s."companyUid" = :companyUid', {
        companyUid: params.companyUid,
      })
      .andWhere('s."createdAt" >= :fromDate', { fromDate: params.fromDate })
      .andWhere('s."createdAt" < :toDate', { toDate: params.toDate })
      .groupBy('m.metric')
      .orderBy(
        `case m.metric
          when 'Faturamento Bruto' then 0
          when 'Lucro' then 1
          else 2
        end`,
      )
      .getRawMany<StatisticSaleStatsByDayOfWeekRow>();
  }
}
