import type { CrudRequest } from '@dataui/crud';
import {
  Crud,
  CrudController,
  CrudRequestInterceptor,
  Override,
  ParsedRequest,
} from '@dataui/crud';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type {
  CompanyTokenPayload,
  EmployeeTokenPayload,
} from 'src/auth/auth.types';
import { CurrentCompany } from 'src/auth/decorators/currentCompany.decorator';
import { CurrentEmployee } from 'src/auth/decorators/currentEmployee.decorator';
import { EmployeeAuthGuard } from 'src/auth/guards/employeeAuth.guard';
import { RequirePermission } from 'src/common/decorators/require-permission.decorator';
import { PermissionsRef } from 'src/modules/permission/const/permissions.ref';
import { CashFlowTransactionEntity } from './cashFlowTransaction.entity';
import { CashFlowTransactionDataUiService } from './domain/cashFlowTransactionDataUi.service';
import { CreateCashFlowTransactionService } from './domain/createCashFlowTransaction.domain';
import { ViewCashFlowTransactionStatsService } from './domain/viewCashFlowTransactionStats.service';
import { CreateCashFlowTransactionDto } from './dto/createCashFlowTransaction.dto';

@Crud({
  model: {
    type: CashFlowTransactionEntity,
  },
  routes: {
    exclude: ['createOneBase'],
  },
  dto: {
    create: CreateCashFlowTransactionDto,
  },
})
@Controller('cash-flow-transaction')
@UseGuards(EmployeeAuthGuard)
export class CashFlowTransactionController implements CrudController<CashFlowTransactionEntity> {
  constructor(
    public service: CashFlowTransactionDataUiService,
    public viewCashFlowTransactionStatsService: ViewCashFlowTransactionStatsService,
    private readonly createCashFlowTransactionService: CreateCashFlowTransactionService,
  ) {}

  @Post()
  @Override('createOneBase')
  async createOne(
    @Body() dto: CreateCashFlowTransactionDto,
    @CurrentCompany() company: CompanyTokenPayload,
    @CurrentEmployee() employee: EmployeeTokenPayload,
  ) {
    return await this.createCashFlowTransactionService.execute(
      dto,
      company.companyUid,
      employee.uid,
    );
  }

  @Get('stats')
  @UseInterceptors(CrudRequestInterceptor)
  async getCashFlowTransactionStats(@ParsedRequest() req: CrudRequest) {
    return await this.viewCashFlowTransactionStatsService.getMany(req);
  }

  @Get(':id/close-stats')
  @RequirePermission(PermissionsRef.CashFlow.Close.name)
  async getCashFlowCloseStats(
    @Param('id') id: number,
    @CurrentCompany() company: CompanyTokenPayload,
  ) {
    return await this.service.getCashFlowStatsForClosing(
      id,
      company.companyUid,
    );
  }
}
