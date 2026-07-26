import { BaseEntity } from 'src/common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { CompanyEntity } from '../company/company.entity';
import { UserEntity } from '../user/user.entity';
import { ProductUnitOfMeasure } from './product.enum';
import { ProductCategoryEntity } from './submodules/productCategory/productCategory.entity';
import { ProductEspecificationEntity } from './submodules/productEspecification/productEspecification.entity';

@Entity({ name: 'products' })
export class ProductEntity extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'varchar', enum: ProductUnitOfMeasure })
  unitOfMeasure: ProductUnitOfMeasure;

  @Column({ nullable: true })
  supplierName: string;

  @Column({ nullable: true })
  productPicture: string;

  @Column()
  createByUserUid: string;

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
