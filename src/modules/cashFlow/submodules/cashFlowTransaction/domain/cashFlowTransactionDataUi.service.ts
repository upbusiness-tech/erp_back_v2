import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResourceNotFoundException } from 'src/exceptions/notFound.exception';
import { CashFlowDataUiService } from 'src/modules/cashFlow/domain/cashFlowDataUi.service';
import { PaymentMethod } from 'src/modules/sale/submodules/salePayment/salePayment.enum';
import { Repository } from 'typeorm';
import { CashFlowTransactionEntity } from '../cashFlowTransaction.entity';
import { TransactionOrigin } from '../cashFlowTransaction.enum';

@Injectable()
export class CashFlowTransactionDataUiService extends TypeOrmCrudService<CashFlowTransactionEntity> {
  constructor(
    @InjectRepository(CashFlowTransactionEntity)
    repo: Repository<CashFlowTransactionEntity>,
    public readonly cashFlowService: CashFlowDataUiService,
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

  async getCashFlowStatsForClosing(
    cashFlowId: number,
    companyUid: string,
  ): Promise<Record<PaymentMethod, number>> {
    const cashFlow = await this.cashFlowService.findOne({
      where: {
        id: cashFlowId,
        companyUid,
      },
    });

    if (!cashFlow)
      throw new ResourceNotFoundException(
        `Estatísticas para fechar caixa ${cashFlowId}`,
      );

    const rows = await this.repo.manager
      .getRepository(CashFlowTransactionEntity)
      .createQueryBuilder('cft')
      .innerJoin('cft.cashFlow', 'cf')
      .leftJoin('cft.sale', 's')
      .select('cft.flowMethodType', 'type')
      .addSelect(
        `SUM(CASE WHEN cft.origin = 'Sangria' THEN - cft.amount ELSE cft.amount END) 
       + CASE WHEN cft.flowMethodType = :cashType THEN cf.initialBalance ELSE 0 END`,
        'totalInflow',
      )
      .where('cft.cashFlowId = :cashFlowId', { cashFlowId })
      .andWhere('s.canceledAt IS NULL')
      .groupBy('cft.cashFlowId')
      .addGroupBy('cft.flowMethodType')
      .addGroupBy('cf.initialBalance')
      .setParameters({ cashType: PaymentMethod.CASH }) // Ou 'DINHEIRO', conforme seu enum
      .getRawMany<{ type: PaymentMethod; totalInflow: string }>();

    return rows.reduce(
      (acc, row) => {
        acc[row.type] = Number(row.totalInflow);
        return acc;
      },
      {} as Record<PaymentMethod, number>,
    );
  }
}
