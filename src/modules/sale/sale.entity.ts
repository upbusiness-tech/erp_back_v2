import { BaseEntity } from 'src/common/base.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm';
import { CashFlowEntity } from '../cashFlow/cashFlow.entity';
import { CompanyEntity } from '../company/company.entity';
import { InternCustomerEntity } from '../internCustomer/internCustomer.entity';
import { UserEntity } from '../user/user.entity';
import { SaleStatus, SaleType } from './sale.enum';
import { SaleItemEntity } from './submodules/saleItem/saleItem.entity';
import { SalePaymentEntity } from './submodules/salePayment/salePayment.entity';
import { SaleServiceEntity } from './submodules/saleService/saleService.entity';
import type { DiscountInfo, SaleSummary } from './types/sale.types';

@Entity({ name: 'sales' })
@Unique(['companyUid', 'code'])
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

  @Column({ nullable: true })
  canceledByUserUid: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'canceledByUserUid' })
  canceledByUser: UserEntity;

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

  @Column({ type: 'jsonb', nullable: true })
  discount: DiscountInfo;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  total: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  amountPaid: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  change: number;

  @Column({ type: 'jsonb', nullable: true })
  summary: SaleSummary;

  @OneToMany(() => SaleItemEntity, (saleItem) => saleItem.sale)
  items: SaleItemEntity[];

  @OneToMany(() => SalePaymentEntity, (salePayment) => salePayment.sale)
  payments: SalePaymentEntity[];

  @OneToMany(() => SaleServiceEntity, (saleService) => saleService.sale)
  services: SaleServiceEntity[];
}
