import { BaseUidEntity } from 'src/common/base.entity';
import { CompanyEntity } from 'src/modules/company/company.entity';
import { EmployeeEntity } from 'src/modules/employee/employee.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  Unique,
} from 'typeorm';

@Entity({ name: 'employee_users' })
@Unique(['username'])
export class EmployeeUserEntity extends BaseUidEntity {
  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  employeeUid: string;

  @OneToOne(() => EmployeeEntity)
  @JoinColumn({ name: 'employeeUid' })
  employee: EmployeeEntity;

  @Column()
  companyUid: string;

  @ManyToOne(() => CompanyEntity)
  @JoinColumn({ name: 'companyUid' })
  company: CompanyEntity;
}
