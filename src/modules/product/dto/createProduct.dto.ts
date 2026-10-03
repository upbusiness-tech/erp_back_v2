import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { ProductUnitOfMeasure } from '../product.enum';
import { Type } from 'class-transformer';
import { CreateProductFiscalClassificationDto } from '../submodules/productFiscalClassification/dto/createProductFiscalClassification.dto';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(ProductUnitOfMeasure)
  unitOfMeasure: ProductUnitOfMeasure;

  @IsString()
  @IsOptional()
  supplierName: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  productPicture: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  productCategoryId: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ProductVariant)
  variants: ProductVariant[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateProductFiscalClassificationDto)
  productFiscalClassification?: CreateProductFiscalClassificationDto;
}

export class ProductVariant {
  @IsNumber()
  @IsPositive()
  @IsOptional()
  id?: number;

  @IsString()
  @IsOptional()
  code: string;

  @IsString()
  @IsOptional()
  barcode: string;

  @IsNumber()
  @IsPositive()
  salePrice: number;

  @IsNumber()
  @IsOptional()
  costPrice: number;

  @IsBoolean()
  isStockControlled: boolean;

  @IsNumber()
  @IsOptional()
  stockQuantity: number;

  @IsString()
  @IsOptional()
  size: string;

  @IsString()
  @IsOptional()
  color: string;

  @IsString()
  @IsOptional()
  brand: string;

  @IsNumber()
  @IsOptional()
  productSupplierId: number;
}
