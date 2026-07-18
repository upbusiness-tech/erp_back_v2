import { Crud, CrudController, Override } from '@dataui/crud';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import type {
  CompanyTokenPayload,
  EmployeeTokenPayload,
} from 'src/auth/auth.types';
import { CurrentCompany } from 'src/auth/decorators/currentCompany.decorator';
import { CurrentEmployee } from 'src/auth/decorators/currentEmployee.decorator';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RequirePermission } from 'src/common/decorators/require-permission.decorator';
import { CreateProductService } from './domain/createProduct.service';
import { CreateProductDto } from './dto/createProduct.dto';
import { ProductEntity } from './product.entity';
import { EmployeeAuthGuard } from 'src/auth/guards/employeeAuth.guard';
import { ProductDataUiService } from './domain/productDataUi.service';
import { PermissionsRef } from '../permission/const/permissions.ref';

@Crud({
  model: {
    type: ProductEntity,
  },
  dto: {
    create: CreateProductDto,
  },
})
@Controller('product')
@UseGuards(EmployeeAuthGuard, PermissionsGuard)
export class ProductController implements CrudController<ProductEntity> {
  constructor(
    public service: ProductDataUiService,
    public readonly createProductService: CreateProductService,
  ) {}

  @Post()
  @Override('createOneBase')
  @RequirePermission(PermissionsRef.Product.Create.name)
  async createOne(
    @Body() dto: CreateProductDto,
    @CurrentCompany() company: CompanyTokenPayload,
    @CurrentEmployee() employee: EmployeeTokenPayload,
  ) {
    return await this.createProductService.execute(
      dto,
      company.companyUid,
      employee.uid,
    );
  }
}
