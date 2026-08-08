import { BaseEntity } from 'src/common/base.entity';
import { Column, Entity, Unique } from 'typeorm';

@Entity({ name: 'sale_code_sequence' })
@Unique(['companyUid'])
export class SaleCodeSequenceEntity extends BaseEntity {
  @Column()
  companyUid: string;

  @Column({ type: 'int', default: 0 })
  lastNumber: number;
}
