import { BaseUidEntity } from 'src/common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { CompanyEntity } from '../company/company.entity';
import { EmployeeEntity } from '../employee/employee.entity';

@Entity({ name: 'users' })
export class UserEntity extends BaseUidEntity {
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
