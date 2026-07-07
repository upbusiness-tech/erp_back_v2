import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEspecificationDataUi } from './domain/productEspecificationDataUi.service';
import { ProductEspecificationEntity } from './productEspecification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEspecificationEntity])],
  providers: [ProductEspecificationDataUi],
  exports: [ProductEspecificationDataUi],
})
export class ProductEspecificationModule {}
