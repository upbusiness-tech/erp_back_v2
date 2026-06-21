import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalePaymentEntity } from './salePayment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SalePaymentEntity])],
})
export class SalePaymentModule {}
