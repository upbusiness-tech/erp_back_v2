import { Crud, CrudController, Override } from '@dataui/crud';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import type {
  CompanyTokenPayload,
  EmployeeTokenPayload,
} from 'src/auth/auth.types';
import { CurrentCompany } from 'src/auth/decorators/currentCompany.decorator';
import { CurrentEmployee } from 'src/auth/decorators/currentEmployee.decorator';
import { CashFlowTransactionEntity } from './cashFlowTransaction.entity';
import { CashFlowTransactionDataUiService } from './domain/cashFlowTransactionDataUi.service';
import { CreateCashFlowTransactionService } from './domain/createCashFlowTransaction.domain';
import { CreateCashFlowTransactionDto } from './dto/createCashFlowTransaction.dto';
import { EmployeeAuthGuard } from 'src/auth/guards/employeeAuth.guard';

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
}
