import { Crud, CrudAuth, CrudController, Override } from '@dataui/crud';
import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { CompanyTokenPayload } from 'src/auth/auth.types';
import { CurrentCompany } from 'src/auth/decorators/currentCompany.decorator';
import { EmployeeAuthGuard } from 'src/auth/guards/employeeAuth.guard';
import { RequirePermission } from 'src/common/decorators/require-permission.decorator';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { uidParams } from 'src/consts/uidParams';
import { PermissionsRef } from '../permission/const/permissions.ref';
import { CreateEmployeeService } from './domain/createEmployee.service';
import { DeleteEmployeeService } from './domain/deleteEmployee.service';
import { EmployeeDataUiService } from './domain/employeeDataUi.service';
import { UpdateEmployeeService } from './domain/updateEmployee.service';
import { CreateEmployeeDto } from './dto/createEmployee.dto';
import { EmployeeEntity } from './employee.entity';

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
  query: {
    join: {
      user: {
        eager: true,
        allow: ['username'],
      },
      'user.permissions': {
        eager: true,
        allow: ['key', 'title'],
      },
    },
  },
})
@CrudAuth({
  filter: (req) => ({ companyUid: req.company.companyUid }),
  persist: (req) => ({ companyUid: req.company.companyUid }),
})
@Controller('employee')
@UseGuards(EmployeeAuthGuard, PermissionsGuard)
export class EmployeeController implements CrudController<EmployeeEntity> {
  constructor(
    public service: EmployeeDataUiService,
    public createEmployeeService: CreateEmployeeService,
    public updateEmployeeService: UpdateEmployeeService,
    public deleteEmployeeService: DeleteEmployeeService,
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

  @Override('updateOneBase')
  @Patch(':uidParams')
  @RequirePermission(PermissionsRef.Employee.Update.name)
  async updateOne(
    @Param('uidParams') uid: string,
    @Body() dto: CreateEmployeeDto,
    @CurrentCompany() currentCompany: CompanyTokenPayload,
  ) {
    await this.updateEmployeeService.execute(uid, dto, currentCompany);
  }

  @Override('deleteOneBase')
  @Delete(':uidParams')
  @RequirePermission(PermissionsRef.Employee.Delete.name)
  async deleteOne(
    @Param('uidParams') uid: string,
    @CurrentCompany() currentCompany: CompanyTokenPayload,
  ) {
    await this.deleteEmployeeService.execute(uid, currentCompany);
  }
}
