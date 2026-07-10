import { ArrayMinSize, IsArray, IsNotEmpty, IsNumber } from 'class-validator';
import { InformedValue } from '../cashFlow.entity';

export class CloseCashFlowDto {
  @IsNumber()
  closingBalance: number;

  @IsArray()
  @ArrayMinSize(4)
  @IsNotEmpty()
  informedValues: InformedValue[];
}
