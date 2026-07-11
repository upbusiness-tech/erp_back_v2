import { Crud, CrudAuth, CrudController } from '@dataui/crud';
import { Controller, UseGuards } from '@nestjs/common';
import { EmployeeAuthGuard } from 'src/auth/guards/employeeAuth.guard';
import { InternCustomerDataUiService } from './domain/internCustomerDataUi.service';
import { CreateInternCustomerDto } from './dto/createInternCustomer.dto';
import { InternCustomerEntity } from './internCustomer.entity';
import { UpdateInternCustomerPriceDto } from './submodules/internCustomerPrice/dto/updateInternCustomerPrice.dto';

@Crud({
  model: {
    type: InternCustomerEntity,
  },
  dto: {
    create: CreateInternCustomerDto,
    update: UpdateInternCustomerPriceDto,
  },
})
@CrudAuth({
  filter: (req) => ({ companyUid: req.company.companyUid }),
  persist: (req) => ({ companyUid: req.company.companyUid }),
})
@Controller('intern-customer')
@UseGuards(EmployeeAuthGuard)
export class InternCustomerController implements CrudController<InternCustomerEntity> {
  constructor(public service: InternCustomerDataUiService) {}
}
