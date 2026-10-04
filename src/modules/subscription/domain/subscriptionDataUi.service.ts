import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { differenceInCalendarDays, startOfDay } from 'date-fns';
import { getNextDueDate, getReferenceMonthFromDate } from 'src/common/date';
import { CompanyEntity } from 'src/modules/company/company.entity';
import { CompanyStatus } from 'src/modules/company/company.enum';
import { In, LessThanOrEqual, Repository } from 'typeorm';
import { WebHookDefaultFields } from '../resources/mercadoPago.resource';
import { SubscriptionEntity } from '../subscription.entity';
import { SubscriptionStatus } from '../subscription.enum';
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

  async getWhoSubscrisbesSoon() {
    const companies = await this.companyRepo.find();

    const results = [];
    const today = startOfDay(new Date());

    for (const company of companies) {
      try {
        const nextDueDate = getNextDueDate(company.paymentDay);
        const daysUntilDue = differenceInCalendarDays(nextDueDate, today);

        if (daysUntilDue < 0 || daysUntilDue > 2) {
          continue;
        }

        const referenceMonth = getReferenceMonthFromDate(nextDueDate);
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

  async checkAndupdateOverdue() {
    await this.repo.manager.transaction(async (entityManager) => {
      const today = startOfDay(new Date());
      const overdue = await entityManager.find(SubscriptionEntity, {
        where: {
          status: SubscriptionStatus.PENDING,
          dueDate: LessThanOrEqual(today),
        },
      });

      await entityManager.update(
        SubscriptionEntity,
        {
          id: In(overdue.map((sub) => sub.id)),
        },
        { status: SubscriptionStatus.LATE },
      );

      const companiesUid = overdue.map((sub) => sub.companyUid);

      await entityManager.update(
        CompanyEntity,
        { uid: In(companiesUid) },
        { status: CompanyStatus.DISABLED },
      );
    });
  }

  private async markAsPaid(internalReference: string) {
    const subscription = await this.repo.findOne({
      where: {
        internalReference,
      },
    });

    await this.repo.update(subscription.id, {
      paidAt: new Date(),
      status: SubscriptionStatus.PAID,
    });
  }

  async interceptPayment(webhookPayload: WebHookDefaultFields) {
    try {
      if (webhookPayload?.data?.status === 'processed') {
        await this.markAsPaid(webhookPayload.data.external_reference);
      }
    } catch (error: any) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
