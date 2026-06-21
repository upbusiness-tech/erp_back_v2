import { BaseEntity } from 'src/common/base.entity';
import { InternCustomerPriceEntity } from 'src/modules/internCustomer/submodules/internCustomerPrice/internCustomerPrice.entity';
import { ProductEntity } from 'src/modules/product/product.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { SaleEntity } from '../../sale.entity';

@Entity({ name: 'sales_items' })
export class SaleItemEntity extends BaseEntity {
  @Column()
  note: string;

  @Column()
  quantitySold: number;

  @Column({ type: 'boolean', default: false })
  isEspecialPrice: boolean;

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
  saleId: number;

  @ManyToOne(() => SaleEntity)
  @JoinColumn({ name: 'saleId' })
  sale: SaleEntity;
}
