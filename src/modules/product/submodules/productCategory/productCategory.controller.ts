import { Crud, CrudController, Override } from '@dataui/crud';
import { ProductCategoryEntity } from './productCategory.entity';
import { CreateProductCategoryDto } from './dto/createProductCategory.dto';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ProductCategoryDataUiService } from './domain/productCategoryDataUi.service';
import { CurrentCompany } from 'src/auth/decorators/currentCompany.decorator';
import type { CompanyTokenPayload } from 'src/auth/auth.types';
import { CreateProductCategoryService } from './domain/createProductCategory.service';
import { EmployeeAuthGuard } from 'src/auth/guards/employeeAuth.guard';

@Crud({
  model: {
    type: ProductCategoryEntity,
  },
  dto: {
    create: CreateProductCategoryDto,
  },
})
@Controller('product-category')
@UseGuards(EmployeeAuthGuard)
export class ProductCategoryController implements CrudController<ProductCategoryEntity> {
  constructor(
    public service: ProductCategoryDataUiService,
    public createProductCategoryService: CreateProductCategoryService,
  ) {}

  @Override('createOneBase')
  @Post()
  async createOne(
    @Body() dto: CreateProductCategoryDto,
    @CurrentCompany() company: CompanyTokenPayload,
  ) {
    return await this.createProductCategoryService.execute(
      dto,
      company.companyUid,
    );
  }
}
