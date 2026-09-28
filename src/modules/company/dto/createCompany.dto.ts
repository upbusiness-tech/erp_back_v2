import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(18)
  @MinLength(18)
  document: string;

  @IsEmail()
  @IsNotEmpty()
  contactEmail: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  contactPhoneNumber: string;

  @IsUrl()
  @IsOptional()
  profilePicture: string;

  @IsString()
  description: string;

  @IsString()
  address: string;

  @IsNumber()
  @IsPositive()
  paymentDay: number;

  @IsNumber()
  planId: number;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  managerName: string;
}
