import { BaseUidEntity } from 'src/common/base.entity';
import { CompanyEntity } from 'src/modules/company/company.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

@Entity({ name: 'company_users' })
export class CompanyUserEntity extends BaseUidEntity {
  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  companyUid: string;

  @OneToOne(() => CompanyEntity)
  @JoinColumn({ name: 'companyUid' })
  company: CompanyEntity;
}
