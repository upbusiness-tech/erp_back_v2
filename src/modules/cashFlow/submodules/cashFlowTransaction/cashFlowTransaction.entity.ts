import { BaseEntity } from 'src/common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CashFlowEntity } from '../../cashFlow.entity';
import { TransactionOrigin, TransactionType } from './cashFlowTransaction.enum';
import { SaleEntity } from 'src/modules/sale/sale.entity';
import { PaymentMethod } from 'src/modules/sale/submodules/salePayment/salePayment.enum';

@Entity({ name: 'cash_flow_transactions' })
export class CashFlowTransactionEntity extends BaseEntity {
  @Column({ type: 'decimal' })
  amount: number;

  @Column({ type: 'varchar', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'varchar', enum: PaymentMethod, nullable: true })
  flowMethodType: PaymentMethod;

  @Column({ type: 'varchar', enum: TransactionOrigin })
  origin: TransactionOrigin;

  @Column({ nullable: true, default: null })
  saleId: number;

  @ManyToOne(() => SaleEntity)
  @JoinColumn({ name: 'saleId' })
  sale: SaleEntity;

  @Column()
  cashFlowId: number;

  @ManyToOne(() => CashFlowEntity)
  @JoinColumn({ name: 'cashFlowId' })
  cashFlow: CashFlowEntity;
}
