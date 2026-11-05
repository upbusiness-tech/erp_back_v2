import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { ProductUnitOfMeasure } from '../product.enum';
import { CreateProductFiscalClassificationDto } from '../submodules/productFiscalClassification/dto/createProductFiscalClassification.dto';
import { ProductVariant } from './createProduct.dto';

export class UpdateProductDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsEnum(ProductUnitOfMeasure)
  @IsOptional()
  unitOfMeasure?: ProductUnitOfMeasure;

  @IsString()
  @IsOptional()
  @IsUrl()
  productPicture?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  productCategoryId?: number;

  /**
   * No modo diff contém apenas atualizações (com id) e criações (sem id).
   * No modo legado (sem idsToDelete) contém a lista completa.
   */
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProductVariant)
  variants?: ProductVariant[];

  /**
   * A presença deste campo (mesmo vazio) ativa o modo diff.
   * Ids desconhecidos ou já soft-deleted são ignorados.
   */
  @IsArray()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  @IsOptional()
  idsToDelete?: number[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateProductFiscalClassificationDto)
  productFiscalClassification?: CreateProductFiscalClassificationDto;
}
