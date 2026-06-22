import { BaseEntity } from 'src/common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CompanyEntity } from '../company/company.entity';
import { InvoiceStatus } from './invoice.enum';

@Entity({ name: 'invoices' })
export class InvoiceEntity extends BaseEntity {
  @Column()
  dueDate: Date;

  @Column({ type: 'varchar', enum: InvoiceStatus })
  status: InvoiceStatus;

  @Column({ nullable: true })
  paidAt: Date;

  @Column()
  companyUid: string;

  @ManyToOne(() => CompanyEntity)
  @JoinColumn({ name: 'companyUid' })
  company: CompanyEntity;
}
