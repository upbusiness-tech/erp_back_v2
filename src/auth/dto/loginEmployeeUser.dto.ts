import { IsNotEmpty, IsString } from 'class-validator';

export class LoginEmployeeUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
