import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { SaleType } from '../sale.enum';
import { PaymentMethod } from '../submodules/salePayment/salePayment.enum';

export class CreateSaleDto {
  @IsEnum(SaleType)
  type: SaleType;

  @IsNumber()
  @IsOptional()
  internCustomerId: number;

  @IsNumber()
  cashFlowId: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items: CreateSaleItemDto[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateSalePaymentDto)
  payments: CreateSalePaymentDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleServiceDto)
  services: CreateSaleServiceDto[];
}

export class CreateSaleItemDto {
  @IsString()
  @IsOptional()
  note: string;

  @IsNumber()
  @IsPositive()
  quantitySold: number;

  @IsBoolean()
  isEspecialPrice: boolean;

  @IsNumber()
  @IsOptional()
  internCustomerPriceId: number;

  @IsNumber()
  @IsPositive()
  productId: number;

  @IsNumber()
  @IsPositive()
  productEspecificationId: number;
}

export class CreateSalePaymentDto {
  @IsEnum(PaymentMethod)
  type: PaymentMethod;

  @IsNumber()
  @IsPositive()
  amount: number;
}

export class CreateSaleServiceDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsPositive()
  amount: number;
}
