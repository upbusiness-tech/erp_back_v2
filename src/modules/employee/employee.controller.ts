import { Crud, CrudController, Override } from '@dataui/crud';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { EmployeeAuthGuard } from 'src/auth/guards/employeeAuth.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RequirePermission } from 'src/common/decorators/require-permission.decorator';
import { uidParams } from 'src/consts/uidParams';
import { CreateEmployeeService } from './domain/createEmployee.service';
import { EmployeeDataUiService } from './domain/employeeDataUi.service';
import { CreateEmployeeDto } from './dto/createEmployee.dto';
import { EmployeeEntity } from './employee.entity';
import { CurrentCompany } from 'src/auth/decorators/currentCompany.decorator';
import type { CompanyTokenPayload } from 'src/auth/auth.types';
import { PermissionsRef } from '../permission/const/permissions.ref';

@Crud({
  model: {
    type: EmployeeEntity,
  },
  dto: {
    create: CreateEmployeeDto,
  },
  params: {
    uidParams,
  },
})
@Controller('employee')
@UseGuards(EmployeeAuthGuard, PermissionsGuard)
export class EmployeeController implements CrudController<EmployeeEntity> {
  constructor(
    public service: EmployeeDataUiService,
    public createEmployeeService: CreateEmployeeService,
  ) {}

  @Override('createOneBase')
  @Post()
  @RequirePermission(PermissionsRef.Employee.Create.name)
  async createOne(
    @Body() dto: CreateEmployeeDto,
    @CurrentCompany() currentCompany: CompanyTokenPayload,
  ) {
    await this.createEmployeeService.execute(dto, currentCompany);
  }
}
