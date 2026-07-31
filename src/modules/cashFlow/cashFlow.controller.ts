import { Crud, CrudController } from '@dataui/crud';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import type {
  CompanyTokenPayload,
  EmployeeTokenPayload,
} from 'src/auth/auth.types';
import { CurrentCompany } from 'src/auth/decorators/currentCompany.decorator';
import { CurrentEmployee } from 'src/auth/decorators/currentEmployee.decorator';
import { EmployeeAuthGuard } from 'src/auth/guards/employeeAuth.guard';
import { RequirePermission } from 'src/common/decorators/require-permission.decorator';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { PermissionsRef } from '../permission/const/permissions.ref';
import { CashFlowEntity } from './cashFlow.entity';
import { CashFlowDataUiService } from './domain/cashFlowDataUi.service';
import { CloseCashFlowService } from './domain/closeCashFlow.service';
import { OpenCashFlowService } from './domain/openCashFlow.service';
import { CloseCashFlowDto } from './dto/closeCashFlowEntity.dto';
import { OpenCashFlowDto } from './dto/openCashFlowEntity.dto';

@Crud({
  model: {
    type: CashFlowEntity,
  },
  routes: {
    exclude: ['createOneBase'],
  },
  dto: {
    create: OpenCashFlowDto,
  },
})
@Controller('cash-flow')
@UseGuards(EmployeeAuthGuard, PermissionsGuard)
export class CashFlowController implements CrudController<CashFlowEntity> {
  constructor(
    public service: CashFlowDataUiService,
    private readonly openCashFlowService: OpenCashFlowService,
    private readonly closeCashFlowService: CloseCashFlowService,
  ) {}

  @Post('open')
  @RequirePermission(PermissionsRef.CashFlow.Open.name)
  async openOne(
    @Body() dto: OpenCashFlowDto,
    @CurrentCompany() company: CompanyTokenPayload,
    @CurrentEmployee() employee: EmployeeTokenPayload,
  ) {
    return await this.openCashFlowService.execute(
      dto,
      company.companyUid,
      employee.uid,
    );
  }

  @Get('open')
  async getOpenCash(@CurrentCompany() company: CompanyTokenPayload) {
    return await this.service.getOpenCash(company.companyUid);
  }

  @Post('close')
  @RequirePermission(PermissionsRef.CashFlow.Close.name)
  async closeOne(
    @Body() dto: CloseCashFlowDto,
    @CurrentCompany() company: CompanyTokenPayload,
    @CurrentEmployee() employee: EmployeeTokenPayload,
  ) {
    return await this.closeCashFlowService.execute(
      dto,
      company.companyUid,
      employee.uid,
    );
  }
}
