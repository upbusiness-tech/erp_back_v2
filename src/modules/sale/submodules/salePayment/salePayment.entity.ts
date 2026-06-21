import { BaseEntity } from 'src/common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { PaymentMethod } from './salePayment.enum';
import { SaleEntity } from '../../sale.entity';

@Entity({ name: 'sale_payments' })
export class SalePaymentEntity extends BaseEntity {
  @Column({ type: 'varchar', enum: PaymentMethod })
  type: PaymentMethod;

  @Column({ type: 'decimal' })
  amount: number;

  @Column()
  saleId: number;

  @ManyToOne(() => SaleEntity)
  @JoinColumn({ name: 'saleId' })
  sale: SaleEntity;
}
