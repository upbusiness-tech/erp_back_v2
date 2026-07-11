import { Crud, CrudController } from '@dataui/crud';
import { Controller, UseGuards } from '@nestjs/common';
import { EmployeeAuthGuard } from 'src/auth/guards/employeeAuth.guard';
import { SalePaymentDataUiService } from './domain/salePaymentDataUi.service';
import { SalePaymentEntity } from './salePayment.entity';

@Crud({
  model: {
    type: SalePaymentEntity,
  },
})
@Controller('sale-payment')
@UseGuards(EmployeeAuthGuard)
export class SalePaymentController implements CrudController<SalePaymentEntity> {
  constructor(public service: SalePaymentDataUiService) {}
}
