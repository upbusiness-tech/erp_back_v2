import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CompanyEntity } from '../company/company.entity';
import { InternCustomerType } from './internCustomer.enum';
import { BaseEntity } from 'src/common/base.entity';

@Entity({ name: 'intern_customers' })
export class InternCustomerEntity extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'varchar', enum: InternCustomerType })
  type: InternCustomerType;

  @Column()
  address: string;

  @Column()
  phoneNumber: string;

  @Column()
  companyId: number;

  @ManyToOne(() => CompanyEntity)
  @JoinColumn({ name: 'companyId' })
  company: CompanyEntity;
}
