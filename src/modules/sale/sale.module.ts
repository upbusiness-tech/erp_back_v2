import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaleEntity } from './sale.entity';
import { SaleServiceModule } from './submodules/saleService/saleService.module';
import { SaleItemModule } from './submodules/saleItem/saleItem.module';
import { SalePaymentModule } from './submodules/salePayment/salePayment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SaleEntity]),
    SaleServiceModule,
    SaleItemModule,
    SalePaymentModule,
  ],
})
export class SaleModule {}
