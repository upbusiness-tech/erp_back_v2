import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { EmployeeEntity } from '../employee/employee.entity';
import { BaseEntity } from 'src/common/base.entity';
import { CompanyEntity } from '../company/company.entity';

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity {
  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  employeeId: number;

  @OneToOne(() => EmployeeEntity)
  @JoinColumn({ name: 'employeeId' })
  employee: EmployeeEntity;

  @Column()
  companyId: number;

  @ManyToOne(() => CompanyEntity)
  @JoinColumn({ name: 'companyId' })
  company: CompanyEntity;
}
