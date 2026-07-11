import { BaseEntity } from 'src/common/base.entity';
import { InternCustomerPriceEntity } from 'src/modules/internCustomer/submodules/internCustomerPrice/internCustomerPrice.entity';
import { ProductEntity } from 'src/modules/product/product.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { SaleEntity } from '../../sale.entity';
import { ProductEspecificationEntity } from 'src/modules/product/submodules/productEspecification/productEspecification.entity';

@Entity({ name: 'sales_items' })
export class SaleItemEntity extends BaseEntity {
  @Column({ nullable: true })
  note: string;

  @Column()
  quantitySold: number;

  @Column({ type: 'boolean', default: false })
  isEspecialPrice: boolean;

  /**
   * TODO: avaliar o que vai ser contabilizado na venda, em casos de:
   * 1. um cliente interno foi selecionado aplicando o preço especial, porém também foi passado um discountPrice
   */
  @Column({ nullable: true, type: 'decimal' })
  discountPrice: number;

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
