import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashFlowTransactionEntity } from './cashFlowTransaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CashFlowTransactionEntity])],
})
export class CashFlowTransactionModule {}
