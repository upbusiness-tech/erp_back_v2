import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ViewProductExpandedDetailsEntity } from 'src/views/product/viewProductExpandedDetails.entity';
import { ViewTopSellingProductsEntity } from 'src/views/product/viewTopSellingProducts.entity';
import { CompanyModule } from '../company/company.module';
import { UserModule } from '../user/user.module';
import { CreateProductService } from './domain/createProduct.service';
import { ProductDataUiService } from './domain/productDataUi.service';
import { UpdateProductService } from './domain/updateProduct.service';
import { ViewProductExpandedDetailsService } from './domain/viewProductExpandedDetails.service';
import { ViewTopSellingProductsService } from './domain/viewTopSellingProducts.service';
import { ProductController } from './product.controller';
import { ProductEntity } from './product.entity';
import { ProductCategoryModule } from './submodules/productCategory/productCategory.module';
import { ProductEspecificationEntity } from './submodules/productEspecification/productEspecification.entity';
import { ProductEspecificationModule } from './submodules/productEspecification/productEspecification.module';
import { ProductTransactionRecordsModule } from './submodules/productTransaction/productTransactionRecords.module';
import { InternCustomerPriceEntity } from '../internCustomer/submodules/internCustomerPrice/internCustomerPrice.entity';
import { ProductSupplierModule } from './submodules/productSupplier/productSupplier.module';
import { ViewProductPictureGalleryEntity } from 'src/views/product/viewProductPictureGallery.entity';
import { ViewProductPictureGalleryService } from './domain/viewProductPictureGallery.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity,
      ViewProductExpandedDetailsEntity,
      ViewTopSellingProductsEntity,
      ProductEspecificationEntity,
      InternCustomerPriceEntity,
      ViewProductPictureGalleryEntity,
    ]),
    ProductCategoryModule,
    ProductEspecificationModule,
    ProductTransactionRecordsModule,
    ProductSupplierModule,
    CompanyModule,
    UserModule,
  ],
  controllers: [ProductController],
  providers: [
    CreateProductService,
    UpdateProductService,
    ProductDataUiService,
    ViewProductExpandedDetailsService,
    ViewTopSellingProductsService,
    ViewProductPictureGalleryService,
  ],
})
export class ProductModule {}
