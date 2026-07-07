import { IsEnum, IsNumber, IsPositive } from 'class-validator';
import { ProductTransactionType } from '../productTransactionRecords.enum';

export class CreateProductTransactionRecordDto {
  @IsEnum(ProductTransactionType)
  type: ProductTransactionType;

  @IsNumber()
  @IsPositive()
  value: number;

  @IsNumber()
  productEspecificationId: number;
}
