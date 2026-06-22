import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { CashFlowModule } from './modules/cashFlow/cashFlow.module';
import { CashFlowTransactionModule } from './modules/cashFlow/submodules/cashFlowTransaction/cashFlowTransaction.module';
import { CompanyModule } from './modules/company/company.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { InternCustomerModule } from './modules/internCustomer/internCustomer.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { PlanModule } from './modules/plan/plan.module';
import { ProductModule } from './modules/product/product.module';
import { ProductCategoryModule } from './modules/product/submodules/productCategory/productCategory.module';
import { SaleModule } from './modules/sale/sale.module';
import { SaleItemModule } from './modules/sale/submodules/saleItem/saleItem.module';
import { SalePaymentModule } from './modules/sale/submodules/salePayment/salePayment.module';
import { UserModule } from './modules/user/user.module';
import { InternCustomerPriceModule } from './modules/internCustomer/submodules/internCustomerPrice/internCustomerPrice.module';
import { ProductEspecificationModule } from './modules/product/submodules/productEspecification/productEspecification.module';

@Module({
  imports: [
    DbModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CompanyModule,
    PlanModule,
    InvoiceModule,
    EmployeeModule,
    ProductModule,
    ProductCategoryModule,
    CashFlowModule,
    CashFlowTransactionModule,
    UserModule,
    SaleModule,
    SaleItemModule,
    SalePaymentModule,
    InternCustomerModule,
    InternCustomerPriceModule,
    ProductEspecificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
