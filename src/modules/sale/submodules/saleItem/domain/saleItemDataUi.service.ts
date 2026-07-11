import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SaleItemEntity } from '../saleItem.entity';

@Injectable()
export class SaleItemDataUiService extends TypeOrmCrudService<SaleItemEntity> {
  constructor(
    @InjectRepository(SaleItemEntity) repo: Repository<SaleItemEntity>,
  ) {
    super(repo);
  }
}
