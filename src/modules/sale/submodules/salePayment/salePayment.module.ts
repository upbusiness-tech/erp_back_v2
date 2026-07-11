import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalePaymentEntity } from './salePayment.entity';
import { SalePaymentDataUiService } from './domain/salePaymentDataUi.service';
import { SalePaymentController } from './salePayment.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SalePaymentEntity])],
  controllers: [SalePaymentController],
  providers: [SalePaymentDataUiService],
  exports: [SalePaymentDataUiService],
})
export class SalePaymentModule {}
