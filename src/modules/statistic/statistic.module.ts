import { Module } from '@nestjs/common';
import { StatisticStockModule } from './statisticStock/statisticStock.module';

@Module({
  imports: [StatisticStockModule],
})
export class StatisticModule {}
