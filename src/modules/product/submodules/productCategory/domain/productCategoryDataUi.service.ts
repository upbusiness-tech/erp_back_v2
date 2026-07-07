import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductCategoryEntity } from '../productCategory.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductCategoryDataUiService extends TypeOrmCrudService<ProductCategoryEntity> {
  constructor(
    @InjectRepository(ProductCategoryEntity)
    repo: Repository<ProductCategoryEntity>,
  ) {
    super(repo);
  }
}
