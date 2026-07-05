import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export class BaseDateEntity {
  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;

  @DeleteDateColumn()
  deletedAt?: Date;
}

export class BaseEntity extends BaseDateEntity {
  @PrimaryGeneratedColumn()
  id: number;
}

export class BaseUidEntity extends BaseDateEntity {
  @PrimaryGeneratedColumn('uuid')
  uid: string;
}

// export class BaseUidEntityWithAuditUser extends BaseUidEntity {
//   @Column()
//   createdByUserUid: string;

//   @ManyToOne(() => EmployeeUserEntity)
//   createdByUser: EmployeeUserEntity;

//   @Column()
//   updatedByUserUid: string;

//   @ManyToOne(() => EmployeeUserEntity)
//   updatedByUser?: EmployeeUserEntity;

//   @Column()
//   deletedByUserUid: string;

//   @ManyToOne(() => EmployeeUserEntity)
//   deletedByUser?: EmployeeUserEntity;
// }
