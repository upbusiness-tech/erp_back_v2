import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ResourceNotFoundException } from 'src/exceptions/notFound.exception';
import { CashFlowDataUiService } from 'src/modules/cashFlow/domain/cashFlowDataUi.service';
import { PaymentMethod } from 'src/modules/sale/submodules/salePayment/salePayment.enum';
import {
  TransactionOrigin,
  TransactionType,
} from '../cashFlowTransaction.enum';
import { CreateCashFlowTransactionDto } from '../dto/createCashFlowTransaction.dto';
import { CashFlowTransactionDataUiService } from './cashFlowTransactionDataUi.service';

@Injectable()
export class CreateCashFlowTransactionService {
  constructor(
    private readonly cashFlowTransactionService: CashFlowTransactionDataUiService,
    private readonly cashFlowService: CashFlowDataUiService,
  ) {}

  async execute(
    dto: CreateCashFlowTransactionDto,
    companyUid: string,
    employeeUserUid: string,
  ) {
    try {
      const cashFlow = await this.cashFlowService.findOne({
        where: {
          companyUid,
          isClosed: false,
        },
      });

      if (!cashFlow) throw new ResourceNotFoundException('Caixa');

      let transactionType;
      if (
        dto.origin === TransactionOrigin.REPLACEMENT ||
        dto.origin === TransactionOrigin.SALE
      ) {
        transactionType = TransactionType.INFLOW;
      } else {
        transactionType = TransactionType.OUTFLOW;
      }

      return await this.cashFlowTransactionService.save({
        ...dto,
        cashFlowId: cashFlow.id,
        type: transactionType,
        createdByUserUid: employeeUserUid,
        flowMethodType: PaymentMethod.CASH,
      });
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
