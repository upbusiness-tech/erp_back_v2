import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InternCustomerEntity } from '../internCustomer.entity';

@Injectable()
export class InternCustomerDataUiService extends TypeOrmCrudService<InternCustomerEntity> {
  constructor(
    @InjectRepository(InternCustomerEntity)
    repo: Repository<InternCustomerEntity>,
  ) {
    super(repo);
  }
}
