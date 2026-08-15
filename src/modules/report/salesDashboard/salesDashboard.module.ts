import { Module } from '@nestjs/common';
import { SalesDashboardController } from './salesDashboard.controller';
import { SalesDashboardService } from './salesDashboard.service';

@Module({
  controllers: [SalesDashboardController],
  providers: [SalesDashboardService],
})
export class SalesDashboardModule {}
