import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ViewTopSellingProductsEntity } from 'src/views/product/viewTopSellingProducts.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ViewTopSellingProductsService extends TypeOrmCrudService<ViewTopSellingProductsEntity> {
  constructor(
    @InjectRepository(ViewTopSellingProductsEntity)
    repo: Repository<ViewTopSellingProductsEntity>,
  ) {
    super(repo);
  }
}
