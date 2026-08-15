import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { SaleType } from 'src/modules/sale/sale.enum';
import { PaymentMethod } from 'src/modules/sale/submodules/salePayment/salePayment.enum';

function normalizeQueryList(value: unknown): unknown[] | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  return Array.isArray(value) ? value : [value];
}

export class SalesDashboardQueryDto {
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  from: string;

  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  to: string;

  @IsOptional()
  @Transform(({ value }) => normalizeQueryList(value))
  @IsEnum(PaymentMethod, { each: true })
  paymentType?: PaymentMethod[];

  @IsOptional()
  @Transform(({ value }) => normalizeQueryList(value))
  @IsEnum(SaleType, { each: true })
  saleType?: SaleType[];

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  saleCode?: string;
}
