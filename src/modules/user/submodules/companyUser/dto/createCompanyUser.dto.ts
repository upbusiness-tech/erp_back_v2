import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateCompanyUserDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsNumber()
  @IsPositive()
  companyUid: string;
}
