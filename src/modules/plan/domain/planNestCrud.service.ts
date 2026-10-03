import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanEntity } from '../plan.entity';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { CompanyEntity } from 'src/modules/company/company.entity';
import { ResourceNotFoundException } from 'src/exceptions/notFound.exception';

@Injectable()
export class PlanNestCrudService extends TypeOrmCrudService<PlanEntity> {
  constructor(
    @InjectRepository(PlanEntity) repo: Repository<PlanEntity>,
    @InjectRepository(CompanyEntity)
    private companyRepo: Repository<CompanyEntity>,
  ) {
    super(repo);
  }

  async getCompanyPlan(companyUid: string) {
    const company = await this.companyRepo.findOne({
      where: { uid: companyUid },
      relations: { plan: true },
    });

    if (!company) throw new ResourceNotFoundException('Company');

    return company.plan;
  }
}
