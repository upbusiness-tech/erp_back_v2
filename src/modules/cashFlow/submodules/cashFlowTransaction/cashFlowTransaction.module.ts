import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashFlowModule } from '../../cashFlow.module';
import { CashFlowTransactionController } from './cashFlowTransaction.controller';
import { CashFlowTransactionEntity } from './cashFlowTransaction.entity';
import { CashFlowTransactionDataUiService } from './domain/cashFlowTransactionDataUi.service';
import { CreateCashFlowTransactionService } from './domain/createCashFlowTransaction.domain';

@Module({
  imports: [
    TypeOrmModule.forFeature([CashFlowTransactionEntity]),
    forwardRef(() => CashFlowModule),
  ],
  providers: [
    CashFlowTransactionDataUiService,
    CreateCashFlowTransactionService,
  ],
  controllers: [CashFlowTransactionController],
})
export class CashFlowTransactionModule {}
