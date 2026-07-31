import { IsDateString, IsEnum, IsOptional, IsUrl } from 'class-validator';
import { InvoiceStatus } from '../invoice.enum';

export class UpdateInvoiceDto {
  @IsOptional()
  @IsDateString()
  dueDate: Date;

  @IsOptional()
  @IsEnum(InvoiceStatus)
  status: InvoiceStatus;

  @IsOptional()
  @IsDateString()
  paidAt: Date | null;

  @IsOptional()
  @IsUrl()
  paymentProofUrl: string;
}
