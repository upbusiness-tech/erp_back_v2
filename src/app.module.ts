import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { CashFlowModule } from './modules/cashFlow/cashFlow.module';
import { CompanyModule } from './modules/company/company.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { InternCustomerModule } from './modules/internCustomer/internCustomer.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { PlanModule } from './modules/plan/plan.module';
import { ProductModule } from './modules/product/product.module';
import { SaleModule } from './modules/sale/sale.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    DbModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({ global: true }),
    CompanyModule,
    PlanModule,
    InvoiceModule,
    EmployeeModule,
    ProductModule,
    CashFlowModule,
    UserModule,
    SaleModule,
    InternCustomerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
