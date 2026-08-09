import { Module } from '@nestjs/common';
import { ProductDashboardModule } from './productDashboard/productDashboard.module';

@Module({
  imports: [ProductDashboardModule],
})
export class ReportModule {}
