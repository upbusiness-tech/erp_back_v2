import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from 'src/modules/product/product.entity';
import { ProductEspecificationEntity } from 'src/modules/product/submodules/productEspecification/productEspecification.entity';
import { ProductTransactionRecordsEntity } from 'src/modules/product/submodules/productTransaction/productTransactionRecords.entity';
import { SaleEntity } from 'src/modules/sale/sale.entity';
import { StatisticStockController } from './statisticStock.controller';
import { StatisticStockRepository } from './statisticStock.repository';
import { StatisticStockService } from './statisticStock.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity,
      ProductEspecificationEntity,
      ProductTransactionRecordsEntity,
      SaleEntity,
    ]),
  ],
  controllers: [StatisticStockController],
  providers: [StatisticStockService, StatisticStockRepository],
})
export class StatisticStockModule {}
