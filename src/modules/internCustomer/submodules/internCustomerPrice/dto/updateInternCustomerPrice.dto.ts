import { PickType } from '@nestjs/mapped-types';
import { CreateInternCustomerPriceDto } from './createInternCustomerPrice.dto';

export class UpdateInternCustomerPriceDto extends PickType(
  CreateInternCustomerPriceDto,
  ['specialPrice'],
) {}
