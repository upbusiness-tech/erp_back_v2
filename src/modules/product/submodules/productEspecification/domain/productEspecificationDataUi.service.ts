import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEspecificationEntity } from '../productEspecification.entity';

@Injectable()
export class ProductEspecificationDataUi extends TypeOrmCrudService<ProductEspecificationEntity> {
  constructor(
    @InjectRepository(ProductEspecificationEntity)
    repo: Repository<ProductEspecificationEntity>,
  ) {
    super(repo);
  }
}
