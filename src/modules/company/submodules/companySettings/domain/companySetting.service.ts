import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    const allSettingDefs = Object.values(SettingsRef).flatMap((group) =>
      Object.values(group),
    );

    const existingDefs = await this.repo.find({
      select: { id: true, key: true },
    });
    const existingKeys = new Set(existingDefs.map((d) => d.key));

    const newDefs: CompanySettingEntity[] = [];
    for (const def of allSettingDefs) {
      if (existingKeys.has(def.key)) continue;

      const entity = new CompanySettingEntity();
      entity.key = def.key;
      entity.description = def.description;
      entity.default = def.defaultActive;
      entity.planId = def.plan;
      newDefs.push(entity);
    }

    let definitionsCreated = 0;
    if (newDefs.length > 0) {
      await this.repo.insert(newDefs);
      definitionsCreated = newDefs.length;
    }

    const currentDefs =
      newDefs.length > 0 ? await this.repo.find() : existingDefs;

    const companies = await this.companyRepo.find({
      select: { uid: true, planId: true },
    });

    const existingUsage = await this.companySettingUsageRepo.find({
      select: { companyUid: true, companySettingId: true },
    });
    const usageKeySet = new Set(
      existingUsage.map((u) => `${u.companyUid}:${u.companySettingId}`),
    );

    const newUsage: CompanySettingUsageEntity[] = [];
    for (const company of companies) {
      for (const def of currentDefs) {
        const defWithPlan = allSettingDefs.find((d) => d.key === def.key);
        if (
          defWithPlan?.plan &&
          company.planId !== defWithPlan.plan.valueOf()
        ) {
          continue;
        }

        const key = `${company.uid}:${def.id}`;
        if (usageKeySet.has(key)) continue;

        const usage = new CompanySettingUsageEntity();
        usage.isActive = def.default;
        usage.companyUid = company.uid;
        usage.companySettingId = String(def.id);
        newUsage.push(usage);
      }
    }

    let usageCreated = 0;
    if (newUsage.length > 0) {
      await this.companySettingUsageRepo.insert(newUsage);
      usageCreated = newUsage.length;
    }

    return { definitionsCreated, usageCreated };
  }
}
