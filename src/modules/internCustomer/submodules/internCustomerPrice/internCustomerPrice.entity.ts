import { BaseEntity } from 'src/common/base.entity';
import { ProductEntity } from 'src/modules/product/product.entity';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { InternCustomerEntity } from '../../internCustomer.entity';

@Entity({ name: 'intern_customer_prices' })
@Unique(['internCustomerId', 'productId'])
export class InternCustomerPriceEntity extends BaseEntity {
  @Column({ type: 'decimal' })
  specialPrice: number;

  @Column()
  internCustomerId: number;

  @ManyToOne(() => InternCustomerEntity)
  @JoinColumn({ name: 'internCustomerId' })
  internCustomer: InternCustomerEntity;

  @Column()
  productId: number;

  @ManyToOne(() => ProductEntity)
  @JoinColumn({ name: 'productId' })
  product: ProductEntity;
}
