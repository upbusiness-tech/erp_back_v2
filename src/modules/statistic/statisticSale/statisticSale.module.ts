import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from 'src/modules/product/product.entity';
import { ProductEspecificationEntity } from 'src/modules/product/submodules/productEspecification/productEspecification.entity';
import { ProductTransactionRecordsEntity } from 'src/modules/product/submodules/productTransaction/productTransactionRecords.entity';
import { SaleEntity } from 'src/modules/sale/sale.entity';
import { StatisticSaleController } from './statisticSale.controller';
import { StatisticSaleRepository } from './statisticSale.repository';
import { StatisticSaleService } from './statisticSale.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity,
      ProductEspecificationEntity,
      ProductTransactionRecordsEntity,
      SaleEntity,
    ]),
  ],
  controllers: [StatisticSaleController],
  providers: [StatisticSaleService, StatisticSaleRepository],
})
export class StatisticSaleModule {}
