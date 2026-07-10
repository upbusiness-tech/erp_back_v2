import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { PaymentMethod } from 'src/modules/sale/submodules/salePayment/salePayment.enum';
import {
  TransactionOrigin,
  TransactionType,
} from '../cashFlowTransaction.enum';

export class CreateCashFlowTransactionDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsEnum(PaymentMethod)
  flowMethodType: PaymentMethod;

  @IsEnum(TransactionOrigin)
  origin: TransactionOrigin;

  @IsNumber()
  cashFlowId: number;
}
