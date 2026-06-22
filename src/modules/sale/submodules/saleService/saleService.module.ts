import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaleServiceEntity } from './saleService.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SaleServiceEntity])],
})
export class SaleServiceModule {}
