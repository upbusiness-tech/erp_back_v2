import { BaseEntity } from 'src/common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { CompanyEntity } from '../../company.entity';
import { CompanySettingEntity } from '../companySettings/companySetting.entity';

@Entity({ name: 'company_settings_usage' })
@Unique(['companyUid', 'companySettingId'])
export class CompanySettingUsageEntity extends BaseEntity {
  @Column({ type: 'boolean' })
  isActive: boolean;

  @Column()
  companyUid: string;

  @ManyToOne(() => CompanyEntity)
  @JoinColumn({ name: 'companyUid' })
  company: CompanyEntity;

  @Column()
  companySettingId: number;

  @ManyToOne(() => CompanySettingEntity)
  @JoinColumn({ name: 'companySettingId' })
  companySetting: CompanySettingEntity;
}
