import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SaleServiceEntity } from '../saleService.entity';

@Injectable()
export class SaleServiceDataUiService extends TypeOrmCrudService<SaleServiceEntity> {
  constructor(
    @InjectRepository(SaleServiceEntity) repo: Repository<SaleServiceEntity>,
  ) {
    super(repo);
  }
}
