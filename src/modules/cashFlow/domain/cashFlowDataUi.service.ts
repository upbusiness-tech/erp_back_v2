import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CashFlowEntity } from '../cashFlow.entity';

@Injectable()
export class CashFlowDataUiService extends TypeOrmCrudService<CashFlowEntity> {
  constructor(
    @InjectRepository(CashFlowEntity) repo: Repository<CashFlowEntity>,
  ) {
    super(repo);
  }
}
