import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ViewProductTransactionDetailsEntity } from 'src/views/product/viewProductTransactionDetails.entity';
import { ProductOverviewStatsService } from './domain/productOverviewStats.service';
import { ViewProductTransactionDetailsService } from './domain/viewTopSellingProducts.service';
import { ProductDashboardController } from './productDashboard.controller';
import { ProductDashboardService } from './productDashboard.service';
import { ProductTransactionDashboardController } from './productTransactionDashboard.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ViewProductTransactionDetailsEntity])],
  controllers: [
    ProductDashboardController,
    ProductTransactionDashboardController,
  ],
  providers: [
    ProductDashboardService,
    ProductOverviewStatsService,
    ViewProductTransactionDetailsService,
  ],
})
export class ProductDashboardModule {}
