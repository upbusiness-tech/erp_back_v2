import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashFlowEntity } from './cashFlow.entity';
import { CashFlowTransactionModule } from './submodules/cashFlowTransaction/cashFlowTransaction.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CashFlowEntity]),
    CashFlowTransactionModule,
  ],
})
export class CashFlowModule {}
