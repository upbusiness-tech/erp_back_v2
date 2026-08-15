import { Module } from '@nestjs/common';
import { ProductDashboardModule } from './productDashboard/productDashboard.module';
import { SalesDashboardModule } from './salesDashboard/salesDashboard.module';

@Module({
  imports: [ProductDashboardModule, SalesDashboardModule],
})
export class ReportModule {}
