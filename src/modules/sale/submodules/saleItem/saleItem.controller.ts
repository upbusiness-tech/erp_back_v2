import { Crud, CrudController } from '@dataui/crud';
import { Controller, UseGuards } from '@nestjs/common';
import { EmployeeAuthGuard } from 'src/auth/guards/employeeAuth.guard';
import { SaleItemDataUiService } from './domain/saleItemDataUi.service';
import { SaleItemEntity } from './saleItem.entity';

@Crud({
  model: {
    type: SaleItemEntity,
  },
})
@Controller('sale-item')
@UseGuards(EmployeeAuthGuard)
export class SaleItemController implements CrudController<SaleItemEntity> {
  constructor(public service: SaleItemDataUiService) {}
}
