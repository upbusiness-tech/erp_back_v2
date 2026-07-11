import { Crud, CrudController } from '@dataui/crud';
import { Controller, UseGuards } from '@nestjs/common';
import { EmployeeAuthGuard } from 'src/auth/guards/employeeAuth.guard';
import { SaleServiceDataUiService } from './domain/saleServiceDataUi.service';
import { SaleServiceEntity } from './saleService.entity';

@Crud({
  model: {
    type: SaleServiceEntity,
  },
})
@Controller('sale-service')
@UseGuards(EmployeeAuthGuard)
export class SaleServiceController implements CrudController<SaleServiceEntity> {
  constructor(public service: SaleServiceDataUiService) {}
}
