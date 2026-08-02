import { BaseEntity } from 'src/common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { CompanyEntity } from '../company/company.entity';
import { InternCustomerType } from './internCustomer.enum';
import { InternCustomerPriceEntity } from './submodules/internCustomerPrice/internCustomerPrice.entity';

@Entity({ name: 'intern_customers' })
export class InternCustomerEntity extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'varchar', enum: InternCustomerType })
  type: InternCustomerType;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column()
  companyUid: string;

  @ManyToOne(() => CompanyEntity)
  @JoinColumn({ name: 'companyUid' })
  company: CompanyEntity;

  @OneToMany(
    () => InternCustomerPriceEntity,
    (internCustomerPrice) => internCustomerPrice.internCustomer,
    { cascade: ['soft-remove'] },
  )
  internCustomerPrices: InternCustomerPriceEntity[];
}
