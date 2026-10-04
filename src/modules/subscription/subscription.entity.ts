import { BaseEntity } from 'src/common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { CompanyEntity } from '../company/company.entity';
import { SubscriptionStatus } from './subscription.enum';

@Entity({ name: 'subscriptions' })
@Unique(['companyUid', 'referenceMonth'])
export class SubscriptionEntity extends BaseEntity {
  @Column()
  dueDate: Date;

  @Column({ type: 'varchar', enum: SubscriptionStatus })
  status: SubscriptionStatus;

  @Column({ type: 'varchar', length: 7 })
  referenceMonth: string;

  @Column({ nullable: true })
  paidAt: Date;

  @Column({ unique: true })
  internalReference: string;

  @Column({ nullable: true })
  externalId: string;

  @Column({ nullable: true })
  externalLink: string;

  @Column()
  companyUid: string;

  @ManyToOne(() => CompanyEntity)
  @JoinColumn({ name: 'companyUid' })
  company: CompanyEntity;
}
