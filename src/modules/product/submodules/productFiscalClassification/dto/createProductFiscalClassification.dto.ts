import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import {
  CsosnEnum,
  OriginEnum,
  PisCofinsCstEnum,
} from '../enum/productFiscalClassification.enum';

export class CreateProductFiscalClassificationDto {
  @IsString()
  @IsNotEmpty()
  ncm: string;

  @IsString()
  @IsNotEmpty()
  cfop: string;

  @IsEnum(OriginEnum)
  @IsNotEmpty()
  origin: OriginEnum;

  @IsEnum(CsosnEnum)
  @IsNotEmpty()
  csosn: CsosnEnum;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  cest?: string;

  @IsEnum(PisCofinsCstEnum)
  @IsNotEmpty()
  pis: PisCofinsCstEnum;

  @IsEnum(PisCofinsCstEnum)
  @IsNotEmpty()
  cofins: PisCofinsCstEnum;
}
