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
import { PermissionModule } from './modules/permission/permission.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './exceptions/handler/allExceptions.handler';

@Module({
  imports: [
    DbModule,
    AuthModule,
    PermissionModule,
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
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
