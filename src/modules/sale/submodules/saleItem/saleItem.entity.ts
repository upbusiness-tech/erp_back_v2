import { BaseEntity } from 'src/common/base.entity';
import { numericTransformer } from 'src/common/transformers';
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

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: numericTransformer,
  })
  quantitySold: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    transformer: numericTransformer,
  })
  unitSold: number;

  @Column({ type: 'varchar' })
  unitOfMeasure: string;

  @Column({ type: 'boolean', default: false })
  isEspecialPrice: boolean;

  @Column({ type: 'jsonb', nullable: true })
  productSnapshot: Partial<ProductEspecificationEntity>;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: numericTransformer,
  })
  salePriceSnapshot: number;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: numericTransformer,
  })
  specialPriceSnapshot: number;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: numericTransformer,
  })
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

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: numericTransformer,
  })
  amountItem: number;

  @ManyToOne(() => ProductEspecificationEntity)
  @JoinColumn({ name: 'productEspecificationId' })
  productEspecification: ProductEspecificationEntity;

  @Column()
  saleId: number;

  @ManyToOne(() => SaleEntity)
  @JoinColumn({ name: 'saleId' })
  sale: SaleEntity;
}
