import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SaleEntity } from '../sale.entity';

@Injectable()
export class SaleDataUiService extends TypeOrmCrudService<SaleEntity> {
  constructor(@InjectRepository(SaleEntity) repo: Repository<SaleEntity>) {
    super(repo);
  }
}
