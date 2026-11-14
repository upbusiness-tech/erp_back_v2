import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ViewProductStockOverviewEntity } from 'src/views/product/viewProductStockOverview.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ViewProductStockOverviewService extends TypeOrmCrudService<ViewProductStockOverviewEntity> {
  constructor(
    @InjectRepository(ViewProductStockOverviewEntity)
    repo: Repository<ViewProductStockOverviewEntity>,
  ) {
    super(repo);
  }
}
