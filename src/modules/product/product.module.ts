import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './product.entity';
import { ProductCategoryModule } from './submodules/productCategory/productCategory.module';
import { ProductEspecificationModule } from './submodules/productEspecification/productEspecification.module';
import { CreateProductService } from './domain/createProduct.service';
import { ProductDataUiService } from './domain/productDataUi.service';
import { ProductController } from './product.controller';
import { CompanyModule } from '../company/company.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductEntity]),
    ProductCategoryModule,
    ProductEspecificationModule,
    CompanyModule,
    UserModule,
  ],
  controllers: [ProductController],
  providers: [CreateProductService, ProductDataUiService],
})
export class ProductModule {}
