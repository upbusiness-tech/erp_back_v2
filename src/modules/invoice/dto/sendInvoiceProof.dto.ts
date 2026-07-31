import { IsUrl } from 'class-validator';

export class SendInvoiceProofDto {
  @IsUrl()
  paymentProofUrl: string;
}
