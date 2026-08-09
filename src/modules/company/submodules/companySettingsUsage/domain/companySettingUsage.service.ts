import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanySettingUsageEntity } from '../companySettingUsage.entity';

@Injectable()
export class CompanySettingUsageService extends TypeOrmCrudService<CompanySettingUsageEntity> {
  constructor(
    @InjectRepository(CompanySettingUsageEntity)
    repo: Repository<CompanySettingUsageEntity>,
  ) {
    super(repo);
  }

  async toggleActive(id: number): Promise<CompanySettingUsageEntity> {
    const usage = await this.repo.findOne({ where: { id } });

    if (!usage) {
      throw new NotFoundException('Configuração de uso não encontrada');
    }

    usage.isActive = !usage.isActive;

    return this.repo.save(usage);
  }
}
