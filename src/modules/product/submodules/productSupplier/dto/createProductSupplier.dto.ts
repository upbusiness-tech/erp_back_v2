import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProductSupplierDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
