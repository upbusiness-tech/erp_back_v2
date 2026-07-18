import { BaseEntity } from 'src/common/base.entity';
import { Column, Entity, ManyToMany } from 'typeorm';
import { UserEntity } from '../user/user.entity';

@Entity({ name: 'permissions' })
export class PermissionEntity extends BaseEntity {
  @Column({ nullable: false })
  module: string;

  @Column({ nullable: false, unique: true })
  key: string;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  description: string;

  @ManyToMany(() => UserEntity, (user) => user.permissions)
  users: UserEntity[];
}
