import { BaseEntity } from 'src/common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CompanyEntity } from '../company/company.entity';
import { ProductUnitOfMeasure } from './product.enum';
import { ProductCategoryEntity } from './submodules/productCategory/productCategory.entity';
import { EmployeeEntity } from '../employee/employee.entity';

export type ProductEspecifications = {
  size: string;
  color: string;
};

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

  @ManyToOne(() => EmployeeEntity)
  @JoinColumn({ name: 'createByUserUid' })
  createByUser: EmployeeEntity;

  @Column({ type: 'jsonb', default: {} })
  especification: ProductEspecifications;

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
}
