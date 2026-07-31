import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { TransactionOrigin } from '../cashFlowTransaction.enum';

export class CreateCashFlowTransactionDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsEnum(TransactionOrigin)
  origin: TransactionOrigin;

  @IsString()
  @IsOptional()
  note: string;
}
