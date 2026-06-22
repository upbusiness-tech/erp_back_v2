import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './product.entity';
import { ProductCategoryModule } from './submodules/productCategory/productCategory.module';
import { ProductEspecificationModule } from './submodules/productEspecification/productEspecification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductEntity]),
    ProductCategoryModule,
    ProductEspecificationModule,
  ],
})
export class ProductModule {}
