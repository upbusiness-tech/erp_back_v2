import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { Injectable } from '@nestjs/common';
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
}
