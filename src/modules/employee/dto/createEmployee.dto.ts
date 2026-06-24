import { IsBoolean, IsEnum, IsString, MaxLength } from 'class-validator';
import { EmployeeType } from '../employee.enum';

export class CreateEmployeeDto {
  @IsString()
  @MaxLength(30)
  name: string;

  @IsEnum(EmployeeType)
  type: EmployeeType;

  @IsBoolean()
  isActive: boolean;

  @IsString()
  companyUid: string;
}
