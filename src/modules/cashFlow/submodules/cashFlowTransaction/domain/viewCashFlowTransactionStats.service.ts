import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ViewCashFlowTransactionStatsEntity } from 'src/views/cashFlow/cashFlowTransaction/viewCashFlowTransactionStats.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ViewCashFlowTransactionStatsService extends TypeOrmCrudService<ViewCashFlowTransactionStatsEntity> {
  constructor(
    @InjectRepository(ViewCashFlowTransactionStatsEntity)
    repo: Repository<ViewCashFlowTransactionStatsEntity>,
  ) {
    super(repo);
  }
}
