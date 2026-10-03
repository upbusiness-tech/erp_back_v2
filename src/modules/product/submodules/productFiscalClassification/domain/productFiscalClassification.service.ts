import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductFiscalClassificationEntity } from '../productFiscalClassification.entity';

@Injectable()
export class ProductFiscalClassificationService extends TypeOrmCrudService<ProductFiscalClassificationEntity> {
  constructor(
    @InjectRepository(ProductFiscalClassificationEntity)
    repo: Repository<ProductFiscalClassificationEntity>,
  ) {
    super(repo);
  }
}
