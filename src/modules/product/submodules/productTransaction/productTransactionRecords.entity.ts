import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ProductEspecificationEntity } from '../productEspecification/productEspecification.entity';
import { UserEntity } from 'src/modules/user/user.entity';
import { BaseEntity } from 'src/common/base.entity';
import { ProductTransactionType } from './productTransactionRecords.enum';

@Entity({ name: 'product_transactions_records' })
export class ProductTransactionRecordsEntity extends BaseEntity {
  @Column({ type: 'varchar', enum: ProductTransactionType })
  type: ProductTransactionType;

  @Column({ type: 'int' })
  value: number;

  @Column({ nullable: false })
  productEspecificationId: number;

  @ManyToOne(() => ProductEspecificationEntity)
  @JoinColumn({
    name: 'productEspecificationId',
  })
  productEspecification: ProductEspecificationEntity;

  @Column({ nullable: false })
  createdByUserUid: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({
    name: 'createdByUserUid',
  })
  createdByUser: UserEntity;
}
