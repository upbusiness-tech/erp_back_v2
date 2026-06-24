import { Controller } from '@nestjs/common';
import { Crud, CrudController } from '@dataui/crud';
import { CompanyEntity } from './company.entity';
import { CompanyNestCrudService } from './domain/companyNestCrud.service';
import { CreateCompanyDto } from './dto/createCompany.dto';
import { uidParams } from 'src/consts/uidParams';

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
  constructor(public service: CompanyNestCrudService) {}
}
