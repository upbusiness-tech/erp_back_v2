import { IsNotEmpty, IsString } from 'class-validator';

export class CreateEmployeeUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  employeeUid: string;
}
