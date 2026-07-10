import { BaseUidEntity } from 'src/common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { CompanyEntity } from '../company/company.entity';
import { EmployeeType } from './employee.enum';
import { UserEntity } from '../user/user.entity';

@Entity({ name: 'employees' })
export class EmployeeEntity extends BaseUidEntity {
  @Column()
  name: string;

  @Column({ type: 'varchar', enum: EmployeeType })
  type: EmployeeType;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column()
  companyUid: string;

  @ManyToOne(() => CompanyEntity)
  @JoinColumn({ name: 'companyUid' })
  company: CompanyEntity;

  @OneToOne(() => UserEntity, (user) => user.employee)
  user: UserEntity;
}
