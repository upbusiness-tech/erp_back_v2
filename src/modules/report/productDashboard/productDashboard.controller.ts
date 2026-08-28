import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { CompanyTokenPayload } from 'src/auth/auth.types';
import { CurrentCompany } from 'src/auth/decorators/currentCompany.decorator';
import { EmployeeAuthGuard } from 'src/auth/guards/employeeAuth.guard';
import { RequirePermission } from 'src/common/decorators/require-permission.decorator';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { PermissionsRef } from 'src/modules/permission/const/permissions.ref';
import { ProductOverviewStatsService } from './domain/productOverviewStats.service';
import { TopSellingCategoriesService } from './domain/topSellingCategories.service';
import { ProductDashboardQueryDto } from './dto/productDashboardQuery.dto';
import { ProductDashboardService } from './productDashboard.service';

@Controller('report/product-dashboard')
@UseGuards(EmployeeAuthGuard, PermissionsGuard)
export class ProductDashboardController {
  constructor(
    private readonly productDashboardService: ProductDashboardService,
    private readonly productOverviewStatsService: ProductOverviewStatsService,
    private readonly topSellingCategoriesService: TopSellingCategoriesService,
  ) {}

  @Get()
  @RequirePermission(PermissionsRef.Stats.ViewProductStats.name)
  async getDashboard(
    @Query() query: ProductDashboardQueryDto,
    @CurrentCompany() company: CompanyTokenPayload,
  ) {
    return this.productDashboardService.getDashboard(query, company.companyUid);
  }

  @Get('top-selling-categories')
  @RequirePermission(PermissionsRef.Stats.ViewProductStats.name)
  async getTopSellingCategories(
    @Query() query: ProductDashboardQueryDto,
    @CurrentCompany() company: CompanyTokenPayload,
  ) {
    return this.topSellingCategoriesService.getTopSellingCategories(
      query.from,
      query.to,
      company.companyUid,
      query.limit,
    );
  }

  @Get(':id/overview-stats')
  @RequirePermission(PermissionsRef.Stats.ViewProductStats.name)
  async getOverviewStats(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: ProductDashboardQueryDto,
    @CurrentCompany() company: CompanyTokenPayload,
  ) {
    return this.productOverviewStatsService.getOverviewStats(
      id,
      query.from,
      query.to,
      company.companyUid,
    );
  }
}
