import { BaseEntity } from 'src/common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CompanyEntity } from '../company/company.entity';
import { EmployeeType } from './employee.enum';

@Entity({ name: 'employees' })
export class EmployeeEntity extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'varchar', enum: EmployeeType })
  type: EmployeeType;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column()
  companyId: number;

  @ManyToOne(() => CompanyEntity)
  @JoinColumn({ name: 'companyId' })
  company: CompanyEntity;
}
