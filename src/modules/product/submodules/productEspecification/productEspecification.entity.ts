import { BaseEntity } from 'src/common/base.entity';
import { InternCustomerPriceEntity } from 'src/modules/internCustomer/submodules/internCustomerPrice/internCustomerPrice.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { ProductEntity } from '../../product.entity';
import { ProductSupplierEntity } from '../productSupplier/productSupplier.entity';

@Entity({ name: 'product_especifications' })
export class ProductEspecificationEntity extends BaseEntity {
  @Column()
  code: string;

  @Column({ nullable: true })
  barcode: string;

  @Column({ type: 'decimal' })
  salePrice: number;

  @Column({ type: 'decimal', nullable: true })
  costPrice: number;

  @Column({ type: 'boolean', default: true })
  isStockControlled: boolean;

  @Column()
  stockQuantity: number;

  @Column({ nullable: true })
  size: string;

  @Column({ nullable: true })
  color: string;

  @Column({ nullable: true })
  brand: string;

  @Column({ nullable: true })
  productSupplierId: number;

  @ManyToOne(() => ProductSupplierEntity)
  @JoinColumn({ name: 'productSupplierId' })
  productSupplier: ProductSupplierEntity;

  @Column()
  productId: number;

  @ManyToOne(() => ProductEntity)
  @JoinColumn({ name: 'productId' })
  product: ProductEntity;

  @OneToMany(
    () => InternCustomerPriceEntity,
    (internCustomerPrice) => internCustomerPrice.productEspecification,
    { cascade: ['soft-remove'] },
  )
  internCustomerPrices: InternCustomerPriceEntity[];
}
