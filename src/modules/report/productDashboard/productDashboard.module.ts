import { Module } from '@nestjs/common';
import { ProductDashboardController } from './productDashboard.controller';
import { ProductDashboardService } from './productDashboard.service';

@Module({
  controllers: [ProductDashboardController],
  providers: [ProductDashboardService],
})
export class ProductDashboardModule {}
