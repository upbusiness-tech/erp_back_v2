import { BaseEntity } from 'src/common/base.entity';
import { Column, Entity, Unique } from 'typeorm';

@Entity({ name: 'company_settings' })
@Unique(['key'])
export class CompanySettingEntity extends BaseEntity {
  @Column()
  module: string;

  @Column()
  key: string;

  @Column()
  description: string;

  @Column({ type: 'boolean' })
  default: boolean;
}
