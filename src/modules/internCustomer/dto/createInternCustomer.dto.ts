import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { InternCustomerType } from '../internCustomer.enum';

export class CreateInternCustomerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(InternCustomerType)
  type: InternCustomerType;

  @IsString()
  @IsOptional()
  address: string;

  @IsString()
  @IsOptional()
  phoneNumber: string;
}
