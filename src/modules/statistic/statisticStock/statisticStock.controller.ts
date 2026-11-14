import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import type { CompanyTokenPayload } from 'src/auth/auth.types';
import { CurrentCompany } from 'src/auth/decorators/currentCompany.decorator';
import { EmployeeAuthGuard } from 'src/auth/guards/employeeAuth.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { StatisticStockService } from './statisticStock.service';
import { QueryStatisticPeriodDto } from '../common/dto/queryStatisticPeriod.dto';

@Controller('statistic/stock')
@UseGuards(EmployeeAuthGuard, PermissionsGuard)
export class StatisticStockController {
  constructor(private readonly statisticStockService: StatisticStockService) {}

  @Get('history-overview')
  async getOverview(
    @CurrentCompany() company: CompanyTokenPayload,
    @Query() query: QueryStatisticPeriodDto,
  ) {
    return await this.statisticStockService.getHistoryOverviewWithRangeDate(
      company.companyUid,
      query,
    );
  }

  @Get('health-overview')
  async getHealth(
    @CurrentCompany() company: CompanyTokenPayload,
    @Query() query: QueryStatisticPeriodDto,
  ) {
    return await this.statisticStockService.getHealthOverview(
      company.companyUid,
      query,
    );
  }
}
