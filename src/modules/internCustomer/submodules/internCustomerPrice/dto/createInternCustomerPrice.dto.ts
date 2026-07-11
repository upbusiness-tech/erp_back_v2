import { IsNumber, IsPositive } from 'class-validator';

export class CreateInternCustomerPriceDto {
  @IsNumber()
  @IsPositive()
  specialPrice: number;

  @IsNumber()
  internCustomerId: number;

  @IsNumber()
  productEspecificationId: number;
}
