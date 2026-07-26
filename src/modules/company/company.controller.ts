import { Crud, CrudAuth, CrudController, Override } from '@dataui/crud';
import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import type { CompanyTokenPayload } from 'src/auth/auth.types';
import { CurrentCompany } from 'src/auth/decorators/currentCompany.decorator';
import { EmployeeAuthGuard } from 'src/auth/guards/employeeAuth.guard';
import { uidParams } from 'src/consts/uidParams';
import { CompanyEntity } from './company.entity';
import { CompanyNestCrudService } from './domain/companyNestCrud.service';
import { CreateCompanyService } from './domain/createCompany.service';
import { CreateCompanyDto } from './dto/createCompany.dto';
import { ViewCompanyDetailsService } from './domain/viewCompanyDetails.service';
import { UpdateCompanyDto } from './dto/updateCompany.dto';
import { RequirePermission } from 'src/common/decorators/require-permission.decorator';
import { PermissionsRef } from '../permission/const/permissions.ref';

@Crud({
  model: {
    type: CompanyEntity,
  },
  dto: {
    create: CreateCompanyDto,
    update: UpdateCompanyDto,
  },
  routes: {
    exclude: [
      'createManyBase',
      'deleteOneBase',
      'recoverOneBase',
      'replaceOneBase',
      'getOneBase',
    ],
  },
  params: {
    uidParams,
  },
})
@CrudAuth({
  filter: (req) => ({ companyUid: req.company.companyUid }),
  persist: (req) => ({ companyUid: req.company.companyUid }),
})
@UseGuards(EmployeeAuthGuard)
@Controller('company')
export class CompanyController implements CrudController<CompanyEntity> {
  constructor(
    public service: CompanyNestCrudService,
    public createCompanyService: CreateCompanyService,
    public viewCompanyDetailsService: ViewCompanyDetailsService,
  ) {}

  @Post()
  @Override('createOneBase')
  async createOne(@Body() dto: CreateCompanyDto) {
    await this.createCompanyService.execute(dto);
  }

  @Get('me')
  @RequirePermission(PermissionsRef.Company.ReadAny.name)
  async getMe(@CurrentCompany() company: CompanyTokenPayload) {
    return await this.viewCompanyDetailsService.getMe(company.companyUid);
  }

  @Patch('me')
  @RequirePermission(PermissionsRef.Company.UpdateAny.name)
  async updateMe(
    @Body() dto: UpdateCompanyDto,
    @CurrentCompany() company: CompanyTokenPayload,
  ) {
    return await this.service.updateMe(dto, company.companyUid);
  }
}
