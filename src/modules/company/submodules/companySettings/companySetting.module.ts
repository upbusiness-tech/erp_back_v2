import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanySettingController } from './companySetting.controller';
import { CompanySettingEntity } from './companySetting.entity';
import { CompanySettingService } from './domain/companySetting.service';
import { CompanyEntity } from '../../company.entity';
import { CompanySettingUsageEntity } from '../companySettingsUsage/companySettingUsage.entity';
import { CompanySettingUsageModule } from '../companySettingsUsage/companySettingUsage.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      CompanySettingEntity,
      CompanyEntity,
      CompanySettingUsageEntity,
    ]),
    CompanySettingUsageModule,
  ],
  controllers: [CompanySettingController],
  providers: [CompanySettingService],
  exports: [CompanySettingService],
})
export class CompanySettingModule {}
