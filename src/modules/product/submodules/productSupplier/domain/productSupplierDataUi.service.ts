import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductSupplierEntity } from '../productSupplier.entity';

@Injectable()
export class ProductSupplierDataUiService extends TypeOrmCrudService<ProductSupplierEntity> {
  constructor(
    @InjectRepository(ProductSupplierEntity)
    repo: Repository<ProductSupplierEntity>,
  ) {
    super(repo);
  }
}
