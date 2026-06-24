import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanEntity } from '../plan.entity';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';

@Injectable()
export class PlanNestCrudService extends TypeOrmCrudService<PlanEntity> {
  constructor(@InjectRepository(PlanEntity) repo: Repository<PlanEntity>) {
    super(repo);
  }
}
