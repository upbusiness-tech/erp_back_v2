import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashFlowEntity } from './cashFlow.entity';
import { CashFlowDataUiService } from './domain/cashFlowDataUi.service';
import { CloseCashFlowService } from './domain/closeCashFlow.service';
import { OpenCashFlowService } from './domain/openCashFlow.service';
import { CashFlowTransactionModule } from './submodules/cashFlowTransaction/cashFlowTransaction.module';
import { CashFlowController } from './cashFlow.controller';
import { CompanyModule } from '../company/company.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CashFlowEntity]),
    forwardRef(() => CashFlowTransactionModule),
    CompanyModule,
    UserModule,
  ],
  providers: [CashFlowDataUiService, OpenCashFlowService, CloseCashFlowService],
  controllers: [CashFlowController],
  exports: [CashFlowDataUiService],
})
export class CashFlowModule {}
