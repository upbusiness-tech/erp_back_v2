import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ViewProductTransactionDetailsEntity } from 'src/views/product/viewProductTransactionDetails.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ViewProductTransactionDetailsService extends TypeOrmCrudService<ViewProductTransactionDetailsEntity> {
  constructor(
    @InjectRepository(ViewProductTransactionDetailsEntity)
    repo: Repository<ViewProductTransactionDetailsEntity>,
  ) {
    super(repo);
  }
}
