import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaleEntity } from './sale.entity';
import { SaleServiceModule } from './submodules/saleService/saleService.module';
import { SaleItemModule } from './submodules/saleItem/saleItem.module';
import { SalePaymentModule } from './submodules/salePayment/salePayment.module';
import { SaleDataUiService } from './domain/saleDataUi.service';
import { SaleController } from './sale.controller';
import { CashFlowModule } from '../cashFlow/cashFlow.module';
import { CompanyModule } from '../company/company.module';
import { UserModule } from '../user/user.module';
import { CreateSaleService } from './domain/createSale.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SaleEntity]),
    SaleServiceModule,
    SaleItemModule,
    SalePaymentModule,
    CashFlowModule,
    CompanyModule,
    UserModule,
  ],
  controllers: [SaleController],
  providers: [SaleDataUiService, CreateSaleService],
  exports: [SaleDataUiService],
})
export class SaleModule {}
