import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Matches,
  Max,
  Min,
} from 'class-validator';

const DEFAULT_LIMIT = 5;
const MAX_DEFAULT_LIMIT = 15;

export enum EOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class QueryStatisticPeriodDto {
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  from: string;

  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  to: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_DEFAULT_LIMIT)
  limit: number = DEFAULT_LIMIT;

  @IsOptional()
  @IsEnum(EOrder)
  order: EOrder;
}
