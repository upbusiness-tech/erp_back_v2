import { BaseEntity } from 'src/common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { PlanEntity } from '../plan/plan.entity';
import { CompanyStatus } from './company.enum';

@Entity({ name: 'companies' })
export class CompanyEntity extends BaseEntity {
  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  document: string;

  @Column({ type: 'varchar' })
  contactEmail: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar' })
  phoneNumber: string;

  @Column({ type: 'varchar' })
  contactPhoneNumber: string;

  @Column({ type: 'varchar', nullable: true })
  profilePicture: string;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @Column({ type: 'varchar' })
  address: string;

  @Column()
  paymentDay: number;

  @Column({
    type: 'varchar',
    enum: CompanyStatus,
    default: CompanyStatus.TEST_PERIOD,
  })
  status: CompanyStatus;

  @Column({ nullable: false })
  planId: number;

  @ManyToOne(() => PlanEntity)
  @JoinColumn({ name: 'planId' })
  plan: PlanEntity;
}
