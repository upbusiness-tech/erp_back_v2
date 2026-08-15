import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import type { CompanyTokenPayload } from 'src/auth/auth.types';
import { CurrentCompany } from 'src/auth/decorators/currentCompany.decorator';
import { EmployeeAuthGuard } from 'src/auth/guards/employeeAuth.guard';
import { RequirePermission } from 'src/common/decorators/require-permission.decorator';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { PermissionsRef } from 'src/modules/permission/const/permissions.ref';
import { SalesDashboardQueryDto } from './dto/salesDashboardQuery.dto';
import { SalesDashboardService } from './salesDashboard.service';

@Controller('report/sales-dashboard')
@UseGuards(EmployeeAuthGuard, PermissionsGuard)
export class SalesDashboardController {
  constructor(private readonly salesDashboardService: SalesDashboardService) {}

  @Get()
  @RequirePermission(PermissionsRef.Report.ViewSales.name)
  async getDashboard(
    @Query() query: SalesDashboardQueryDto,
    @CurrentCompany() company: CompanyTokenPayload,
  ) {
    return this.salesDashboardService.getDashboard(query, company.companyUid);
  }
}
