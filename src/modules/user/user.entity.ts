import { BaseUidEntity } from 'src/common/base.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { UserType } from './user.enum';
import { CompanyEntity } from '../company/company.entity';
import { EmployeeEntity } from '../employee/employee.entity';
import { PermissionEntity } from '../permission/permission.entity';

@Entity({ name: 'users' })
export class UserEntity extends BaseUidEntity {
  @Column({ nullable: true })
  email: string;

  @Column({ unique: true, nullable: true })
  username: string;

  @Column()
  password: string;

  @Column({ type: 'varchar', enum: UserType })
  type: UserType;

  @Column()
  companyUid: string;

  @ManyToOne(() => CompanyEntity)
  company: CompanyEntity;

  @Column({ nullable: true })
  employeeUid: string;

  @OneToOne(() => EmployeeEntity, (employee) => employee.user, {
    cascade: true,
  })
  @JoinColumn({
    name: 'employeeUid',
  })
  employee: EmployeeEntity;

  @ManyToMany(() => PermissionEntity, (permission) => permission.users)
  @JoinTable({
    name: 'user_permissions',
    joinColumn: {
      name: 'user_uid',
      referencedColumnName: 'uid',
    },
    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id',
    },
  })
  permissions: PermissionEntity[];
}
