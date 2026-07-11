import { Crud, CrudAuth, CrudController, Override } from '@dataui/crud';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import type {
  CompanyTokenPayload,
  EmployeeTokenPayload,
} from 'src/auth/auth.types';
import { CurrentCompany } from 'src/auth/decorators/currentCompany.decorator';
import { CurrentEmployee } from 'src/auth/decorators/currentEmployee.decorator';
import { EmployeeAuthGuard } from 'src/auth/guards/employeeAuth.guard';
import { CreateSaleService } from './domain/createSale.service';
import { SaleDataUiService } from './domain/saleDataUi.service';
import { CreateSaleDto } from './dto/createSale.dto';
import { SaleEntity } from './sale.entity';

@Crud({
  model: {
    type: SaleEntity,
  },
  dto: {
    create: CreateSaleDto,
  },
})
@CrudAuth({
  filter: (req) => ({ companyUid: req.company.companyUid }),
  persist: (req) => ({
    companyUid: req.company.companyUid,
    soldByUserUid: req.employee.uid,
  }),
})
@Controller('sale')
@UseGuards(EmployeeAuthGuard)
export class SaleController implements CrudController<SaleEntity> {
  constructor(
    public service: SaleDataUiService,
    private readonly createSaleService: CreateSaleService,
  ) {}

  @Override('createOneBase')
  @Post()
  async createOne(
    @Body() dto: CreateSaleDto,
    @CurrentCompany() company: CompanyTokenPayload,
    @CurrentEmployee() employeeUser: EmployeeTokenPayload,
  ) {
    await this.createSaleService.execute(
      dto,
      company.companyUid,
      employeeUser.uid,
    );
  }
}
