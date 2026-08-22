import { Crud, CrudAuth, CrudController, Override } from '@dataui/crud';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
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
import { PermissionsRef } from '../permission/const/permissions.ref';
import { CreateInternCustomerService } from './domain/createInternCustomer.service';
import { InternCustomerDataUiService } from './domain/internCustomerDataUi.service';
import { UpdateInternCustomerService } from './domain/updateInternCustomer.service';
import { CreateInternCustomerDto } from './dto/createInternCustomer.dto';
import { InternCustomerEntity } from './internCustomer.entity';

@Crud({
  model: {
    type: InternCustomerEntity,
  },
  dto: {
    create: CreateInternCustomerDto,
    update: CreateInternCustomerDto,
  },
  routes: {
    exclude: ['createManyBase', 'updateOneBase'],
    deleteOneBase: {
      decorators: [
        RequirePermission(PermissionsRef.InternCustomer.Delete.name),
      ],
    },
  },
  query: {
    softDelete: true,
    join: {
      internCustomerPrices: {
        eager: true,
      },
      'internCustomerPrices.productEspecification': {
        eager: true,
        alias: 'productEspecification',
      },
      'internCustomerPrices.productEspecification.product': {
        eager: true,
        allow: ['name'],
      },
    },
  },
})
@CrudAuth({
  filter: (req) => ({ companyUid: req.company.companyUid }),
  persist: (req) => ({ companyUid: req.company.companyUid }),
})
@Controller('intern-customer')
@UseGuards(EmployeeAuthGuard, PermissionsGuard)
export class InternCustomerController implements CrudController<InternCustomerEntity> {
  constructor(
    public service: InternCustomerDataUiService,
    private readonly createInternCustomerService: CreateInternCustomerService,
    private readonly updateInternCustomerService: UpdateInternCustomerService,
  ) {}

  @Post()
  @Override('createOneBase')
  @RequirePermission(PermissionsRef.InternCustomer.Create.name)
  async createOne(
    @Body() dto: CreateInternCustomerDto,
    @CurrentCompany() company: CompanyTokenPayload,
    @CurrentEmployee() employee: EmployeeTokenPayload,
  ) {
    return await this.createInternCustomerService.execute(
      dto,
      company.companyUid,
      employee.uid,
    );
  }

  @Get(':id/sales-total')
  @RequirePermission(PermissionsRef.InternCustomer.Read.name)
  async getSalesTotal(
    @Param('id', ParseIntPipe) id: number,
    @CurrentCompany() company: CompanyTokenPayload,
  ) {
    return await this.service.getSalesTotalByCustomer(id, company.companyUid);
  }

  @Patch(':id')
  @RequirePermission(PermissionsRef.InternCustomer.Update.name)
  async updateOne(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateInternCustomerDto,
    @CurrentCompany() company: CompanyTokenPayload,
    @CurrentEmployee() employee: EmployeeTokenPayload,
  ) {
    return await this.updateInternCustomerService.execute(
      id,
      dto,
      company.companyUid,
      employee.uid,
    );
  }
}
