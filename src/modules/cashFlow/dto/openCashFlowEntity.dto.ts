import { IsNumber, IsPositive } from 'class-validator';

export class OpenCashFlowDto {
  @IsNumber()
  @IsPositive()
  initialBalance: number;
}
