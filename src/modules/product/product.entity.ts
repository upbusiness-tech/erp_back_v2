import { BaseEntity } from 'src/common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CompanyEntity } from '../company/company.entity';
import { ProductUnitOfMeasure } from './product.enum';
import { ProductCategoryEntity } from './submodules/productCategory/productCategory.entity';

export type ProductEspecifications = {
  size: string;
  color: string;
};

@Entity({ name: 'products' })
export class ProductEntity extends BaseEntity {
  @Column()
  name: string;

  @Column()
  code: string;

  @Column({ type: 'decimal' })
  salePrice: number;

  @Column({ type: 'decimal', nullable: true })
  costPrice: number;

  @Column({ type: 'varchar', enum: ProductUnitOfMeasure })
  unitOfMeasure: ProductUnitOfMeasure;

  @Column({ type: 'boolean', default: true })
  isStockControlled: boolean;

  @Column()
  stockQuantity: number;

  @Column({ nullable: true })
  supplierName: string;

  @Column({ nullable: true })
  productPicture: string;

  @Column({ type: 'jsonb', default: {} })
  especification: ProductEspecifications;

  @Column({ nullable: true })
  productCategoryId: number;

  @ManyToOne(() => ProductCategoryEntity)
  @JoinColumn({ name: 'productCategoryId' })
  productCategory: ProductCategoryEntity;

  @Column()
  companyId: number;

  @ManyToOne(() => CompanyEntity)
  @JoinColumn({ name: 'companyId' })
  company: CompanyEntity;
}
