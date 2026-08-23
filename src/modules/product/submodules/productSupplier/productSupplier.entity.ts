import { BaseEntity } from 'src/common/base.entity';
import { CompanyEntity } from 'src/modules/company/company.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'product_suppliers' })
export class ProductSupplierEntity extends BaseEntity {
  @Column()
  name: string;

  @Column()
  companyUid: string;

  @ManyToOne(() => CompanyEntity)
  @JoinColumn({ name: 'companyUid' })
  company: CompanyEntity;
}
