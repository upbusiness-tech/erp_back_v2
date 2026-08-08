import { BaseEntity } from 'src/common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { SaleEntity } from '../../sale.entity';
import type { DiscountInfo } from '../../types/sale.types';

@Entity({ name: 'sales_services' })
export class SaleServiceEntity extends BaseEntity {
  @Column()
  description: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'jsonb', nullable: true })
  discount: DiscountInfo;

  @Column()
  saleId: number;

  @ManyToOne(() => SaleEntity)
  @JoinColumn({ name: 'saleId' })
  sale: SaleEntity;
}
