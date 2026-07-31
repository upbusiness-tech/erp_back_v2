import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { Repository } from 'typeorm';
import { InvoiceEntity } from '../invoice.entity';

@Injectable()
export class InvoiceDataUiService extends TypeOrmCrudService<InvoiceEntity> {
  constructor(
    @InjectRepository(InvoiceEntity) repo: Repository<InvoiceEntity>,
  ) {
    super(repo);
  }
}
