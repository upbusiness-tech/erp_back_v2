import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashFlowModule } from '../../cashFlow.module';
import { CashFlowTransactionController } from './cashFlowTransaction.controller';
import { CashFlowTransactionEntity } from './cashFlowTransaction.entity';
import { CashFlowTransactionDataUiService } from './domain/cashFlowTransactionDataUi.service';
import { CreateCashFlowTransactionService } from './domain/createCashFlowTransaction.domain';
import { ViewCashFlowTransactionStatsService } from './domain/viewCashFlowTransactionStats.service';
import { ViewCashFlowTransactionStatsEntity } from 'src/views/cashFlow/cashFlowTransaction/viewCashFlowTransactionStats.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CashFlowTransactionEntity,
      ViewCashFlowTransactionStatsEntity,
    ]),
    forwardRef(() => CashFlowModule),
  ],
  providers: [
    CashFlowTransactionDataUiService,
    CreateCashFlowTransactionService,
    ViewCashFlowTransactionStatsService,
  ],
  controllers: [CashFlowTransactionController],
})
export class CashFlowTransactionModule {}
