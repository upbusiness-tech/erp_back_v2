import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaleItemEntity } from './saleItem.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SaleItemEntity])],
})
export class SaleItemModule {}
