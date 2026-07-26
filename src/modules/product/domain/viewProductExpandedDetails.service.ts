import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ViewProductExpandedDetailsEntity } from 'src/views/product/viewProductExpandedDetails.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ViewProductExpandedDetailsService extends TypeOrmCrudService<ViewProductExpandedDetailsEntity> {
  constructor(
    @InjectRepository(ViewProductExpandedDetailsEntity)
    repo: Repository<ViewProductExpandedDetailsEntity>,
  ) {
    super(repo);
  }
}
