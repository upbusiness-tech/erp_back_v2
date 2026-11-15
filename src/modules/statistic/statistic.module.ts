import { Module } from '@nestjs/common';
import { StatisticStockModule } from './statisticStock/statisticStock.module';
import { StatisticSaleModule } from './statisticSale/statisticSale.module';

@Module({
  imports: [StatisticStockModule, StatisticSaleModule],
})
export class StatisticModule {}
