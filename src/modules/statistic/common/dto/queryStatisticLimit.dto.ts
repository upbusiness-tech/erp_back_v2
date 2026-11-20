import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { EOrder } from './queryStatisticPeriod.dto';

const DEFAULT_LIMIT = 5;
const MAX_DEFAULT_LIMIT = 15;

/**
 * DTO para endpoints de estatísticas que não dependem de período de datas,
 * apenas de limite e ordenação (ex.: health-overview do estoque).
 */
export class QueryStatisticLimitDto {
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
