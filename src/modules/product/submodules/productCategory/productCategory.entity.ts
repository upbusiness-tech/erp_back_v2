import { BaseEntity } from 'src/common/base.entity';
import { CompanyEntity } from 'src/modules/company/company.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'product_categories' })
export class ProductCategoryEntity extends BaseEntity {
  @Column()
  name: string;

  @Column()
  color: string;

  @Column()
  companyId: number;

  @ManyToOne(() => CompanyEntity)
  @JoinColumn({ name: 'companyId' })
  company: CompanyEntity;
}
