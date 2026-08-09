import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { CompanyEntity } from '../../../company.entity';
import { CompanySettingUsageEntity } from '../../companySettingsUsage/companySettingUsage.entity';
import { CompanySettingEntity } from '../companySetting.entity';
import { SettingsRef } from '../consts/settings.ref';

@Injectable()
export class CompanySettingService extends TypeOrmCrudService<CompanySettingEntity> {
  constructor(
    @InjectRepository(CompanySettingEntity)
    repo: Repository<CompanySettingEntity>,
    @InjectRepository(CompanyEntity)
    private readonly companyRepo: Repository<CompanyEntity>,
    @InjectRepository(CompanySettingUsageEntity)
    private readonly companySettingUsageRepo: Repository<CompanySettingUsageEntity>,
  ) {
    super(repo);
  }

  async sync(): Promise<{ definitionsCreated: number; usageCreated: number }> {
    const allSettingDefs = Object.entries(SettingsRef).flatMap(
      ([module, group]) =>
        Object.values(group).map((def) => ({
          module,
          key: def.key,
          description: def.description,
          default: def.defaultActive,
          planId: def.plan,
        })),
    );

    await this.repo.upsert(allSettingDefs, ['key']);

    const currentDefs = await this.repo.find();

    const companies = await this.companyRepo.find({
      select: { uid: true, planId: true },
    });

    const existingUsage = await this.companySettingUsageRepo.find({
      select: { companyUid: true, companySettingId: true },
    });
    const usageKeySet = new Set(
      existingUsage.map((u) => `${u.companyUid}:${u.companySettingId}`),
    );

    const newUsage: Partial<CompanySettingUsageEntity>[] = [];
    for (const company of companies) {
      for (const def of currentDefs) {
        const defWithPlan = allSettingDefs.find((d) => d.key === def.key);
        if (
          defWithPlan?.planId &&
          company.planId !== defWithPlan.planId.valueOf()
        ) {
          continue;
        }

        const key = `${company.uid}:${def.id}`;
        if (usageKeySet.has(key)) continue;

        newUsage.push({
          isActive: def.default,
          companyUid: company.uid,
          companySettingId: def.id,
        });
      }
    }

    let usageCreated = 0;
    if (newUsage.length > 0) {
      await this.companySettingUsageRepo.insert(newUsage);
      usageCreated = newUsage.length;
    }

    return { definitionsCreated: allSettingDefs.length, usageCreated };
  }

  async createDefaultUsageForCompany(
    entityManager: EntityManager,
    companyUid: string,
    planId: number,
  ): Promise<void> {
    const defs = await entityManager.find(CompanySettingEntity);

    const usage = defs
      .filter((d) => d.planId === planId)
      .map((d) => ({
        isActive: d.default,
        companyUid,
        companySettingId: d.id,
      }));

    if (usage.length > 0) {
      await entityManager.insert(CompanySettingUsageEntity, usage);
    }
  }
}
