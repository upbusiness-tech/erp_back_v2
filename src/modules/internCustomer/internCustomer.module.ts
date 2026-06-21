import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InternCustomerEntity } from './internCustomer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InternCustomerEntity])],
})
export class InternCustomerModule {}
