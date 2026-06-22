import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CompanyEntity } from '../company/company.entity';
import { UserEntity } from '../user/user.entity';
import { SaleStatus, SaleType } from './sale.enum';
import { BaseEntity } from 'src/common/base.entity';
import { CashFlowEntity } from '../cashFlow/cashFlow.entity';
import { InternCustomerEntity } from '../internCustomer/internCustomer.entity';

@Entity({ name: 'sales' })
export class SaleEntity extends BaseEntity {
  @Column()
  code: string;

  @Column({ type: 'varchar', enum: SaleType })
  type: SaleType;

  @Column({ type: 'varchar', enum: SaleStatus })
  status: SaleStatus;

  @Column({ nullable: true, default: null })
  canceledAt: Date;

  @Column({ nullable: true, default: null })
  internCustomerId: number;

  @ManyToOne(() => InternCustomerEntity)
  @JoinColumn({ name: 'internCustomerId' })
  internCustomer: InternCustomerEntity;

  @Column()
  soldByUserUid: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'soldByUserUid' })
  soldByUser: UserEntity;

  @Column()
  cashFlowId: number;

  @ManyToOne(() => CashFlowEntity)
  @JoinColumn({ name: 'cashFlowId' })
  cashFlow: CashFlowEntity;

  @Column()
  companyUid: string;

  @ManyToOne(() => CompanyEntity)
  @JoinColumn({ name: 'companyUid' })
  company: CompanyEntity;
}
