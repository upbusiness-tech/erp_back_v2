import { BaseEntity } from 'src/common/base.entity';
import { InternCustomerPriceEntity } from 'src/modules/internCustomer/submodules/internCustomerPrice/internCustomerPrice.entity';
import { ProductEntity } from 'src/modules/product/product.entity';
import { ProductEspecificationEntity } from 'src/modules/product/submodules/productEspecification/productEspecification.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { SaleEntity } from '../../sale.entity';
import type { DiscountInfo } from '../../types/sale.types';

@Entity({ name: 'sales_items' })
export class SaleItemEntity extends BaseEntity {
  @Column({ nullable: true })
  note: string;

  @Column()
  quantitySold: number;

  @Column({ type: 'boolean', default: false })
  isEspecialPrice: boolean;

  @Column({ type: 'jsonb', nullable: true })
  productSnapshot: Partial<ProductEspecificationEntity>;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  salePriceSnapshot: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  specialPriceSnapshot: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  costPriceSnapshot: number;

  @Column({ type: 'jsonb', nullable: true })
  discountInfo: DiscountInfo;

  @Column({ nullable: true })
  internCustomerPriceId: number;

  @ManyToOne(() => InternCustomerPriceEntity)
  @JoinColumn({ name: 'internCustomerPriceId' })
  internCustomerPrice: InternCustomerPriceEntity;

  @Column()
  productId: number;

  @ManyToOne(() => ProductEntity)
  @JoinColumn({ name: 'productId' })
  product: ProductEntity;

  @Column()
  productEspecificationId: number;

  @ManyToOne(() => ProductEspecificationEntity)
  @JoinColumn({ name: 'productEspecificationId' })
  productEspecification: ProductEspecificationEntity;

  @Column()
  saleId: number;

  @ManyToOne(() => SaleEntity)
  @JoinColumn({ name: 'saleId' })
  sale: SaleEntity;
}
