import { BaseEntity } from 'src/common/base.entity';
import { Column, Entity } from 'typeorm';
import { PlanStatus } from './plan.enum';

@Entity({ name: 'plans' })
export class PlanEntity extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'decimal', nullable: false })
  price: number;

  @Column()
  description: string;

  @Column({ type: 'varchar', enum: PlanStatus, nullable: false })
  status: PlanStatus;
}
