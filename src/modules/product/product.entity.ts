import { BaseEntity } from 'src/common/base.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { CompanyEntity } from '../company/company.entity';
import { UserEntity } from '../user/user.entity';
import { ProductUnitOfMeasure } from './product.enum';
import { ProductCategoryEntity } from './submodules/productCategory/productCategory.entity';
import { ProductEspecificationEntity } from './submodules/productEspecification/productEspecification.entity';
import { numericTransformer } from 'src/common/transformers';
import { ProductFiscalClassificationEntity } from './submodules/productFiscalClassification/productFiscalClassification.entity';

@Entity({ name: 'products' })
export class ProductEntity extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'varchar', enum: ProductUnitOfMeasure })
  unitOfMeasure: ProductUnitOfMeasure;

  @Column({ nullable: true })
  productPicture: string;

  @Column()
  createByUserUid: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    transformer: numericTransformer,
    nullable: true,
  })
  maxStock: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    transformer: numericTransformer,
    nullable: true,
  })
  minStock: number;

  @Column({ nullable: true })
  productFiscalClassificationId: number;

  @OneToOne(
    () => ProductFiscalClassificationEntity,
    (productFiscalClassification) => productFiscalClassification.product,
  )
  @JoinColumn({
    name: 'productFiscalClassificationId',
  })
  productFiscalClassification: ProductFiscalClassificationEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'createByUserUid' })
  createByUser: UserEntity;

  @Column({ nullable: true })
  productCategoryId: number;

  @ManyToOne(() => ProductCategoryEntity)
  @JoinColumn({ name: 'productCategoryId' })
  productCategory: ProductCategoryEntity;

  @Column()
  companyUid: string;

  @ManyToOne(() => CompanyEntity)
  @JoinColumn({ name: 'companyUid' })
  company: CompanyEntity;

  @OneToMany(
    () => ProductEspecificationEntity,
    (productEspecificationEntity) => productEspecificationEntity.product,
    { cascade: ['soft-remove'] },
  )
  productEspecifications: ProductEspecificationEntity[];
}
