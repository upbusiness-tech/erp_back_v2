import { BaseEntity } from 'src/common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CompanyEntity } from '../company/company.entity';
import { UserEntity } from '../user/user.entity';
import { PaymentMethod } from '../sale/submodules/salePayment/salePayment.enum';

export type InformedValue = {
  method: PaymentMethod;
  value: number;
};

@Entity({ name: 'cash_flows' })
export class CashFlowEntity extends BaseEntity {
  @Column()
  openedAt: Date;

  @Column({ type: 'boolean', default: true })
  isOpen: boolean;

  @Column({ type: 'decimal' })
  initialBalance: number;

  @Column({ type: 'decimal', nullable: true })
  closingBalance: number;

  @Column({ nullable: true })
  closedAt: Date;

  @Column({ type: 'jsonb', default: [] })
  informedValues: InformedValue[];

  @Column()
  openedByUserId: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'openedByUserId' })
  openedByUser: UserEntity;

  @Column({ nullable: true, default: null })
  closedByUserId: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'closedByUserId' })
  closedByUser: UserEntity;

  @Column()
  companyId: number;

  @ManyToOne(() => CompanyEntity)
  @JoinColumn({ name: 'companyId' })
  company: CompanyEntity;
}
