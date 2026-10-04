import { IsDateString, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { SubscriptionStatus } from '../subscription.enum';

export class CreateSubscriptionDto {
  @IsDateString()
  dueDate: Date;

  @IsEnum(SubscriptionStatus)
  status: SubscriptionStatus;

  @IsDateString()
  paidAt: Date | null;

  @IsNotEmpty()
  @IsString()
  companyUid: string;
}
