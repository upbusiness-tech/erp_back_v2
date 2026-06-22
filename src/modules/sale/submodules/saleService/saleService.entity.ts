import { BaseEntity } from 'src/common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { SaleEntity } from '../../sale.entity';

@Entity({ name: 'sales_services' })
export class SaleServiceEntity extends BaseEntity {
  @Column()
  description: string;

  @Column()
  amount: number;

  @Column()
  saleId: number;

  @ManyToOne(() => SaleEntity)
  @JoinColumn({ name: 'saleId' })
  sale: SaleEntity;
}
