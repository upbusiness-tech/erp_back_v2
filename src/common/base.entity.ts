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
