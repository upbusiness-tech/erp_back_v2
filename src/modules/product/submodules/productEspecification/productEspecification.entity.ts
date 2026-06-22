import { BaseEntity } from 'src/common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ProductEntity } from '../../product.entity';

@Entity({ name: 'product_especifications' })
export class ProductEspecificationEntity extends BaseEntity {
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

  @Column()
  productId: number;

  @ManyToOne(() => ProductEntity)
  @JoinColumn({ name: 'productId' })
  product: ProductEntity;
}
