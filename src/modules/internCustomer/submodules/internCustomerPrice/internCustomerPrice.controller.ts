import { Crud, CrudController } from '@dataui/crud';
import { Controller, UseGuards } from '@nestjs/common';
import { EmployeeAuthGuard } from 'src/auth/guards/employeeAuth.guard';
import { InternCustomerPriceDataUiService } from './domain/internCustomerPriceDataUi.service';
import { CreateInternCustomerPriceDto } from './dto/createInternCustomerPrice.dto';
import { UpdateInternCustomerPriceDto } from './dto/updateInternCustomerPrice.dto';
import { InternCustomerPriceEntity } from './internCustomerPrice.entity';

@Crud({
  model: {
    type: InternCustomerPriceEntity,
  },
  dto: {
    create: CreateInternCustomerPriceDto,
    update: UpdateInternCustomerPriceDto,
  },
  query: {
    softDelete: true,
    join: {
      productEspecification: {
        eager: true,
      },
      'productEspecification.product': {
        eager: true,
      },
    },
  },
})
@Controller('intern-customer-price')
@UseGuards(EmployeeAuthGuard)
export class InternCustomerPriceController implements CrudController<InternCustomerPriceEntity> {
  constructor(public service: InternCustomerPriceDataUiService) {}
}
