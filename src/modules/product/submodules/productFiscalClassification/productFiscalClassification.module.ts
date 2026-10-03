import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductFiscalClassificationService } from './domain/productFiscalClassification.service';
import { ProductFiscalClassificationController } from './productFiscalClassification.controller';
import { ProductFiscalClassificationEntity } from './productFiscalClassification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductFiscalClassificationEntity])],
  controllers: [ProductFiscalClassificationController],
  providers: [ProductFiscalClassificationService],
})
export class ProductFiscalClassificationModule {}
