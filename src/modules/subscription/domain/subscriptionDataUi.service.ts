import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getReferenceMonth } from 'src/common/date';
import { CompanyEntity } from 'src/modules/company/company.entity';
import { Repository } from 'typeorm';
import { SubscriptionEntity } from '../subscription.entity';
import { CreateSubscriptionWithMPService } from './createSubscriptionWithMP.service';

@Injectable()
export class SubscriptionDataUiService extends TypeOrmCrudService<SubscriptionEntity> {
  constructor(
    @InjectRepository(SubscriptionEntity) repo: Repository<SubscriptionEntity>,
    @InjectRepository(CompanyEntity)
    private readonly companyRepo: Repository<CompanyEntity>,
    private readonly createSubscriptionWithMPService: CreateSubscriptionWithMPService,
  ) {
    super(repo);
  }

  async getCompanysToSubcribeToday() {
    const companies = await this.companyRepo.find({
      where: {
        paymentDay: new Date().getDate(),
      },
    });

    const referenceMonth = getReferenceMonth();
    const results = [];

    for (const company of companies) {
      try {
        const existing = await this.repo.findOne({
          where: {
            companyUid: company.uid,
            referenceMonth,
          },
        });

        if (existing) {
          results.push({
            companyUid: company.uid,
            ok: false,
            skipped: true,
            reason: 'subscription already exists for this month',
          });
          continue;
        }

        const result = await this.createSubscriptionWithMPService.execute(
          company.uid,
        );
        results.push({ companyUid: company.uid, ok: true, result });
      } catch (error: any) {
        results.push({
          companyUid: company.uid,
          ok: false,
          error: error.message,
        });
      }
    }

    return results;
  }
}
