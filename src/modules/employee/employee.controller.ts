import { Crud, CrudController, Override } from '@dataui/crud';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { EmployeeAuthGuard } from 'src/auth/guards/employeeAuth.guard';
import { uidParams } from 'src/consts/uidParams';
import { CreateEmployeeService } from './domain/createEmployee.service';
import { EmployeeDataUiService } from './domain/employeeDataUi.service';
import { CreateEmployeeDto } from './dto/createEmployee.dto';
import { EmployeeEntity } from './employee.entity';
import { CurrentCompany } from 'src/auth/decorators/currentCompany.decorator';
import type { CompanyTokenPayload } from 'src/auth/auth.types';

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
@UseGuards(EmployeeAuthGuard)
export class EmployeeController implements CrudController<EmployeeEntity> {
  constructor(
    public service: EmployeeDataUiService,
    public createEmployeeService: CreateEmployeeService,
  ) {}

  @Override('createOneBase')
  @Post()
  async createOne(
    @Body() dto: CreateEmployeeDto,
    @CurrentCompany() currentCompany: CompanyTokenPayload,
  ) {
    await this.createEmployeeService.execute(dto, currentCompany);
  }
}
