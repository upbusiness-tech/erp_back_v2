import { IsDateString, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { InvoiceStatus } from '../invoice.enum';

export class CreateInvoiceDto {
  @IsDateString()
  dueDate: Date;

  @IsEnum(InvoiceStatus)
  status: InvoiceStatus;

  @IsDateString()
  paidAt: Date | null;

  @IsNotEmpty()
  @IsString()
  companyUid: string;
}
