import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
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

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => InternCustomerValues)
  internCustomerPrices: InternCustomerValues[];
}

export class InternCustomerValues {
  @IsPositive()
  @IsNumber()
  @IsOptional()
  id?: number;

  @IsPositive()
  @IsNumber()
  specialPrice: number;

  @IsPositive()
  @IsNumber()
  productEspecificationId: number;
}
