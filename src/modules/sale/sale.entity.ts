import { BaseEntity } from 'src/common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CashFlowEntity } from '../cashFlow/cashFlow.entity';
import { CompanyEntity } from '../company/company.entity';
import { InternCustomerEntity } from '../internCustomer/internCustomer.entity';
import { SaleStatus, SaleType } from './sale.enum';
import { EmployeeUserEntity } from '../user/submodules/employeeUser/employeeUser.entity';

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

  @ManyToOne(() => EmployeeUserEntity)
  @JoinColumn({ name: 'soldByUserUid' })
  soldByUser: EmployeeUserEntity;

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
