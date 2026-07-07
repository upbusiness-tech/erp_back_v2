import { Module } from '@nestjs/common';
import { ProductCategoryController } from './productCategory.controller';
import { CreateProductCategoryService } from './domain/createProductCategory.service';
import { ProductCategoryDataUiService } from './domain/productCategoryDataUi.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductCategoryEntity } from './productCategory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductCategoryEntity])],
  controllers: [ProductCategoryController],
  providers: [CreateProductCategoryService, ProductCategoryDataUiService],
})
export class ProductCategoryModule {}
