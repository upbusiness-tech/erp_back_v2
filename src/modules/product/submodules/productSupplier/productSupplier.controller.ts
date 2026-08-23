import { Crud, CrudAuth, CrudController } from '@dataui/crud';
import { Controller, UseGuards } from '@nestjs/common';
import { EmployeeAuthGuard } from 'src/auth/guards/employeeAuth.guard';
import { ProductSupplierDataUiService } from './domain/productSupplierDataUi.service';
import { ProductSupplierEntity } from './productSupplier.entity';
import { CreateProductSupplierDto } from './dto/createProductSupplier.dto';

@Crud({
  model: {
    type: ProductSupplierEntity,
  },
  dto: {
    create: CreateProductSupplierDto,
    update: CreateProductSupplierDto,
  },
  query: {
    softDelete: true,
  },
})
@CrudAuth({
  filter: (req) => ({ companyUid: req.company.companyUid }),
  persist: (req) => ({ companyUid: req.company.companyUid }),
})
@Controller('product-supplier')
@UseGuards(EmployeeAuthGuard)
export class ProductSupplierController implements CrudController<ProductSupplierEntity> {
  constructor(public service: ProductSupplierDataUiService) {}
}
