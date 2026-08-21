import { Crud, CrudAuth, CrudController, Override } from '@dataui/crud';
import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import type {
  CompanyTokenPayload,
  EmployeeTokenPayload,
} from 'src/auth/auth.types';
import { CurrentCompany } from 'src/auth/decorators/currentCompany.decorator';
import { CurrentEmployee } from 'src/auth/decorators/currentEmployee.decorator';
import { EmployeeAuthGuard } from 'src/auth/guards/employeeAuth.guard';
import { RequirePermission } from 'src/common/decorators/require-permission.decorator';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { CancelSaleService } from './domain/cancelSale.service';
import { CreateSaleService } from './domain/createSale.service';
import { SaleDataUiService } from './domain/saleDataUi.service';
import { CreateSaleDto } from './dto/createSale.dto';
import { SaleEntity } from './sale.entity';
import { PermissionsRef } from '../permission/const/permissions.ref';

@Crud({
  model: {
    type: SaleEntity,
  },
  dto: {
    create: CreateSaleDto,
  },
  query: {
    join: {
      internCustomer: {
        eager: true,
      },
      items: {
        eager: true,
      },
      'items.productEspecification': {
        eager: true,
        alias: 'productEspecification',
      },
      'items.product': {
        eager: true,
        alias: 'product',
      },
      'items.internCustomerPrice': {
        eager: true,
        alias: 'internCustomerPrice',
      },
      payments: {
        eager: true,
      },
    },
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
@UseGuards(EmployeeAuthGuard, PermissionsGuard)
export class SaleController implements CrudController<SaleEntity> {
  constructor(
    public service: SaleDataUiService,
    private readonly createSaleService: CreateSaleService,
    private readonly cancelSaleService: CancelSaleService,
  ) {}

  @Override('createOneBase')
  @Post()
  @RequirePermission(PermissionsRef.Sale.Create.name)
  async createOne(
    @Body() dto: CreateSaleDto,
    @CurrentCompany() company: CompanyTokenPayload,
    @CurrentEmployee() employeeUser: EmployeeTokenPayload,
  ) {
    return await this.createSaleService.execute(
      dto,
      company.companyUid,
      employeeUser.uid,
    );
  }

  @Patch('cancel/:id')
  @RequirePermission(PermissionsRef.Sale.Cancel.name)
  async cancelSale(
    @Param('id') id: number,
    @CurrentEmployee() employee: EmployeeTokenPayload,
  ) {
    return await this.cancelSaleService.execute(id, employee);
  }
}
