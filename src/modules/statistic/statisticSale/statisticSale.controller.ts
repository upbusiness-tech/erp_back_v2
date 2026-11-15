import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import type { CompanyTokenPayload } from 'src/auth/auth.types';
import { CurrentCompany } from 'src/auth/decorators/currentCompany.decorator';
import { EmployeeAuthGuard } from 'src/auth/guards/employeeAuth.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { QueryStatisticPeriodDto } from '../common/dto/queryStatisticPeriod.dto';
import { StatisticSaleService } from './statisticSale.service';

@Controller('statistic/sale')
@UseGuards(EmployeeAuthGuard, PermissionsGuard)
export class StatisticSaleController {
  constructor(private readonly statisticSaleService: StatisticSaleService) {}

  @Get('history-overview')
  async getHistoryOverview(
    @CurrentCompany() company: CompanyTokenPayload,
    @Query() query: QueryStatisticPeriodDto,
  ) {
    return await this.statisticSaleService.getHistoryOverviewWithRangeDate(
      company.companyUid,
      query,
    );
  }
}
