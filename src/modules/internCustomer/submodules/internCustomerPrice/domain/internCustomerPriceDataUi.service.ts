import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InternCustomerPriceEntity } from '../internCustomerPrice.entity';

@Injectable()
export class InternCustomerPriceDataUiService extends TypeOrmCrudService<InternCustomerPriceEntity> {
  constructor(
    @InjectRepository(InternCustomerPriceEntity)
    repo: Repository<InternCustomerPriceEntity>,
  ) {
    super(repo);
  }
}
