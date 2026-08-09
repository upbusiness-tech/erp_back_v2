import { BaseEntity } from 'src/common/base.entity';
import { PlanEntity } from 'src/modules/plan/plan.entity';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';

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

  @Column()
  planId: number;

  @ManyToOne(() => PlanEntity)
  @JoinColumn({ name: 'planId' })
  plan: PlanEntity;
}
