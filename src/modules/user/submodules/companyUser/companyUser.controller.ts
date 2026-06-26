import { Body, Controller, Post } from '@nestjs/common';
import { CompanyUserDataUiService } from './domain/companyUserDataUi.service';
import { CreateCompanyUserService } from './domain/createCompanyUser.service';
import { Crud, CrudController, Override } from '@dataui/crud';
import { CompanyUserEntity } from './companyUser.entity';
import { CreateCompanyDto } from 'src/modules/company/dto/createCompany.dto';
import { CreateCompanyUserDto } from './dto/createCompanyUser.dto';
import { uidParams } from 'src/consts/uidParams';

@Crud({
  model: {
    type: CompanyUserEntity,
  },
  dto: {
    create: CreateCompanyDto,
  },
  params: {
    uidParams,
  },
})
@Controller('company-user')
export class CompanyUserController implements CrudController<CompanyUserEntity> {
  constructor(
    public readonly service: CompanyUserDataUiService,
    private createCompanyUserService: CreateCompanyUserService,
  ) {}

  @Override('createOneBase')
  @Post()
  async createOne(@Body() body: CreateCompanyUserDto) {
    await this.createCompanyUserService.execute(body);
  }
}
