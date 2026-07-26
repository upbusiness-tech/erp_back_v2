import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class UpdateCompanyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  contactEmail: string;

  @IsString()
  contactPhoneNumber: string;

  @IsUrl()
  @IsOptional()
  profilePicture: string;

  @IsString()
  description: string;

  @IsString()
  address: string;
}
