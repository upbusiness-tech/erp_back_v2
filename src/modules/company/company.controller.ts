import { Body, Controller, Post } from '@nestjs/common';
import { Crud, CrudController, Override } from '@dataui/crud';
import { CompanyEntity } from './company.entity';
import { CompanyNestCrudService } from './domain/companyNestCrud.service';
import { CreateCompanyDto } from './dto/createCompany.dto';
import { uidParams } from 'src/consts/uidParams';
import { CreateCompanyService } from './domain/createCompany.service';

@Crud({
  model: {
    type: CompanyEntity,
  },
  dto: {
    create: CreateCompanyDto,
  },
  params: {
    uidParams,
  },
})
@Controller('company')
export class CompanyController implements CrudController<CompanyEntity> {
  constructor(
    public service: CompanyNestCrudService,
    public createCompanyService: CreateCompanyService,
  ) {}

  @Post()
  @Override('createOneBase')
  async createOne(@Body() dto: CreateCompanyDto) {
    await this.createCompanyService.execute(dto);
  }
}
