import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyEntity } from '../../company.entity';
import { CompanySettingEntity } from '../companySettings/companySetting.entity';
import { CompanySettingUsageController } from './companySettingUsage.controller';
import { CompanySettingUsageEntity } from './companySettingUsage.entity';
import { CompanySettingUsageService } from './domain/companySettingUsage.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      CompanySettingUsageEntity,
      CompanyEntity,
      CompanySettingEntity,
      CompanySettingUsageEntity,
    ]),
  ],
  controllers: [CompanySettingUsageController],
  providers: [CompanySettingUsageService],
  exports: [CompanySettingUsageService],
})
export class CompanySettingUsageModule {}
