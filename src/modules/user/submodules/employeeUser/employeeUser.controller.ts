import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { EmployeeUserEntity } from './employeeUser.entity';
import { Crud, CrudController, Override } from '@dataui/crud';
import { EmployeeUserDataUiService } from './domain/employeeUserDataUi.service';
import { CreateEmployeeUserService } from './domain/createEmployeeUser.service';
import { CreateEmployeeUserDto } from './dto/createEmployeeUser.dto';
import { uidParams } from 'src/consts/uidParams';
import { CompanyAuthGuard } from 'src/auth/guards/companyAuth.guard';
import { CurrentCompany } from 'src/auth/decorators/currentCompany.decorator';
import type { CompanyTokenPayload } from 'src/auth/auth.types';

@Crud({
  model: {
    type: EmployeeUserEntity,
  },
  dto: {
    create: CreateEmployeeUserDto,
  },
  params: {
    uidParams,
  },
})
@Controller('employee-user')
export class EmployeeUserController implements CrudController<EmployeeUserEntity> {
  constructor(
    public readonly service: EmployeeUserDataUiService,
    private createEmployeeUserService: CreateEmployeeUserService,
  ) {}

  @Override('createOneBase')
  @UseGuards(CompanyAuthGuard)
  @Post()
  async createOne(
    @Body() body: CreateEmployeeUserDto,
    @CurrentCompany() company: CompanyTokenPayload,
  ) {
    await this.createEmployeeUserService.execute(body, company);
  }
}
