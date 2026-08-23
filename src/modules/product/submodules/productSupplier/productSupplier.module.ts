import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductSupplierDataUiService } from './domain/productSupplierDataUi.service';
import { ProductSupplierController } from './productSupplier.controller';
import { ProductSupplierEntity } from './productSupplier.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductSupplierEntity])],
  controllers: [ProductSupplierController],
  providers: [ProductSupplierDataUiService],
})
export class ProductSupplierModule {}
