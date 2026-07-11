import { BaseEntity } from 'src/common/base.entity';
import { ProductEspecificationEntity } from 'src/modules/product/submodules/productEspecification/productEspecification.entity';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { InternCustomerEntity } from '../../internCustomer.entity';

@Entity({ name: 'intern_customer_prices' })
@Unique(['internCustomerId', 'productEspecificationId'])
export class InternCustomerPriceEntity extends BaseEntity {
  @Column({ type: 'decimal' })
  specialPrice: number;

  @Column()
  internCustomerId: number;

  @ManyToOne(() => InternCustomerEntity)
  @JoinColumn({ name: 'internCustomerId' })
  internCustomer: InternCustomerEntity;

  @Column()
  productEspecificationId: number;

  @ManyToOne(() => ProductEspecificationEntity)
  @JoinColumn({ name: 'productEspecificationId' })
  productEspecification: ProductEspecificationEntity;
}
