import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InternCustomerEntity } from './internCustomer.entity';
import { InternCustomerPriceModule } from './submodules/internCustomerPrice/internCustomerPrice.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([InternCustomerEntity]),
    InternCustomerPriceModule,
  ],
})
export class InternCustomerModule {}
