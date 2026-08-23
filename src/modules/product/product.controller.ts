import {
  Crud,
  CrudAuth,
  CrudController,
  CrudRequestInterceptor,
  Override,
  ParsedRequest,
} from '@dataui/crud';
import type { CrudRequest } from '@dataui/crud';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type {
  CompanyTokenPayload,
  EmployeeTokenPayload,
} from 'src/auth/auth.types';
import { CurrentCompany } from 'src/auth/decorators/currentCompany.decorator';
import { CurrentEmployee } from 'src/auth/decorators/currentEmployee.decorator';
import { EmployeeAuthGuard } from 'src/auth/guards/employeeAuth.guard';
import { RequirePermission } from 'src/common/decorators/require-permission.decorator';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { PermissionsRef } from '../permission/const/permissions.ref';
import { CreateProductService } from './domain/createProduct.service';
import { ProductDataUiService } from './domain/productDataUi.service';
import { UpdateProductService } from './domain/updateProduct.service';
import { ViewProductExpandedDetailsService } from './domain/viewProductExpandedDetails.service';
import { ViewTopSellingProductsService } from './domain/viewTopSellingProducts.service';
import { CreateProductDto } from './dto/createProduct.dto';
import { ProductEntity } from './product.entity';

@Crud({
  model: {
    type: ProductEntity,
  },
  dto: {
    create: CreateProductDto,
    update: CreateProductDto,
  },
  routes: {
    exclude: ['createManyBase', 'updateOneBase'],
    deleteOneBase: {
      decorators: [RequirePermission(PermissionsRef.Product.Delete.name)],
    },
  },
  query: {
    softDelete: true,
    join: {
      productCategory: {
        eager: true,
        allow: ['name', 'color'],
      },
      productEspecifications: {
        eager: true,
      },
      'productEspecifications.productSupplier': {
        eager: true,
        alias: 'productSupplier',
      },
    },
  },
})
@CrudAuth({
  filter: (req) => ({ companyUid: req.company.companyUid }),
  persist: (req) => ({ companyUid: req.company.companyUid }),
})
@Controller('product')
@UseGuards(EmployeeAuthGuard, PermissionsGuard)
export class ProductController implements CrudController<ProductEntity> {
  constructor(
    public service: ProductDataUiService,
    public viewProductExpandedDetailsService: ViewProductExpandedDetailsService,
    public readonly viewTopSellingProductsService: ViewTopSellingProductsService,
    public readonly createProductService: CreateProductService,
    public readonly updateProductService: UpdateProductService,
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

  @Patch(':id')
  @RequirePermission(PermissionsRef.Product.Update.name)
  async updateOne(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateProductDto,
    @CurrentCompany() company: CompanyTokenPayload,
    @CurrentEmployee() employee: EmployeeTokenPayload,
  ) {
    return await this.updateProductService.execute(
      id,
      dto,
      company.companyUid,
      employee.uid,
    );
  }

  @Get('expanded')
  @UseInterceptors(CrudRequestInterceptor)
  async getManyExpanded(@ParsedRequest() req: CrudRequest) {
    return await this.viewProductExpandedDetailsService.getMany(req);
  }

  @Get('top-selling')
  @UseInterceptors(CrudRequestInterceptor)
  async getTopSelling(@ParsedRequest() req: CrudRequest) {
    return await this.viewTopSellingProductsService.getMany(req);
  }
}
