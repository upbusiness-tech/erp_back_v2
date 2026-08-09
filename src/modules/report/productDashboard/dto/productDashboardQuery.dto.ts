import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  Matches,
  Max,
  Min,
} from 'class-validator';
import {
  PRODUCT_DASHBOARD_DEFAULT_LIMIT,
  PRODUCT_DASHBOARD_MAX_LIMIT,
} from '../productDashboard.constants';

export class ProductDashboardQueryDto {
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
  @Max(PRODUCT_DASHBOARD_MAX_LIMIT)
  limit: number = PRODUCT_DASHBOARD_DEFAULT_LIMIT;
}
