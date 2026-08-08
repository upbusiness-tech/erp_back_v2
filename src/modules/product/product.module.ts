import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ViewProductExpandedDetailsEntity } from 'src/views/product/viewProductExpandedDetails.entity';
import { CompanyModule } from '../company/company.module';
import { UserModule } from '../user/user.module';
import { CreateProductService } from './domain/createProduct.service';
import { ProductDataUiService } from './domain/productDataUi.service';
import { UpdateProductService } from './domain/updateProduct.service';
import { ViewProductExpandedDetailsService } from './domain/viewProductExpandedDetails.service';
import { ProductController } from './product.controller';
import { ProductEntity } from './product.entity';
import { ProductCategoryModule } from './submodules/productCategory/productCategory.module';
import { ProductEspecificationEntity } from './submodules/productEspecification/productEspecification.entity';
import { ProductEspecificationModule } from './submodules/productEspecification/productEspecification.module';
import { ProductTransactionRecordsModule } from './submodules/productTransaction/productTransactionRecords.module';
import { InternCustomerPriceEntity } from '../internCustomer/submodules/internCustomerPrice/internCustomerPrice.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity,
      ViewProductExpandedDetailsEntity,
      ProductEspecificationEntity,
      InternCustomerPriceEntity,
    ]),
    ProductCategoryModule,
    ProductEspecificationModule,
    ProductTransactionRecordsModule,
    CompanyModule,
    UserModule,
  ],
  controllers: [ProductController],
  providers: [
    CreateProductService,
    UpdateProductService,
    ProductDataUiService,
    ViewProductExpandedDetailsService,
  ],
})
export class ProductModule {}
