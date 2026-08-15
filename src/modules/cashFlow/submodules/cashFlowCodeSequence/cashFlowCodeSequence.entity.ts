import { BaseEntity } from 'src/common/base.entity';
import { Column, Entity, Unique } from 'typeorm';

@Entity({ name: 'cash_flow_code_sequence' })
@Unique(['companyUid'])
export class CashFlowCodeSequenceEntity extends BaseEntity {
  @Column()
  companyUid: string;

  @Column({ type: 'int', default: 0 })
  lastNumber: number;
}
