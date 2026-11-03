import { BaseEntity } from 'src/common/base.entity';
import { numericTransformer } from 'src/common/transformers';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { SaleEntity } from '../../sale.entity';
import type { DiscountInfo } from '../../types/sale.types';

@Entity({ name: 'sales_services' })
export class SaleServiceEntity extends BaseEntity {
  @Column()
  description: string;

  @Column()
  onwerEmployee: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'jsonb', nullable: true })
  discount: DiscountInfo;

  /** Parcela rateada do desconto global da venda. */
  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: numericTransformer,
  })
  saleDiscountShare: number;

  @Column()
  saleId: number;

  @ManyToOne(() => SaleEntity)
  @JoinColumn({ name: 'saleId' })
  sale: SaleEntity;
}
