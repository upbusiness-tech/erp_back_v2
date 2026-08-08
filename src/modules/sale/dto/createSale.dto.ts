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
  Min,
  ValidateNested,
} from 'class-validator';
import { SaleType } from '../sale.enum';
import { PaymentMethod } from '../submodules/salePayment/salePayment.enum';

export class DiscountInfoDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  value?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  percent?: number;

  @IsString()
  @IsOptional()
  reason?: string;
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

  @IsOptional()
  @ValidateNested()
  @Type(() => DiscountInfoDto)
  discountInfo: DiscountInfoDto;
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

  @IsOptional()
  @ValidateNested()
  @Type(() => DiscountInfoDto)
  discount: DiscountInfoDto;
}

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

  @IsOptional()
  @ValidateNested()
  @Type(() => DiscountInfoDto)
  discount: DiscountInfoDto;
}
