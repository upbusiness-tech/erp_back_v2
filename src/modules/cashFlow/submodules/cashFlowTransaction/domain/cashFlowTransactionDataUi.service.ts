import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CashFlowTransactionEntity } from '../cashFlowTransaction.entity';
import { TransactionOrigin } from '../cashFlowTransaction.enum';

@Injectable()
export class CashFlowTransactionDataUiService extends TypeOrmCrudService<CashFlowTransactionEntity> {
  constructor(
    @InjectRepository(CashFlowTransactionEntity)
    repo: Repository<CashFlowTransactionEntity>,
  ) {
    super(repo);
  }

  async save(dto: Partial<CashFlowTransactionEntity>) {
    return await this.repo.save(dto);
  }

  async getCashFlowTransactionsByOrigin(
    cashFlowId: number,
    origin: TransactionOrigin,
  ) {
    const transactions = await this.repo.find({
      where: {
        origin,
        cashFlowId: cashFlowId,
      },
    });
    return transactions;
  }
}
