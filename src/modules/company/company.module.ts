import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyController } from './company.controller';
import { CompanyEntity } from './company.entity';
import { CompanyNestCrudService } from './domain/companyNestCrud.service';
import { CreateCompanyService } from './domain/createCompany.service';
import { CompanySettingModule } from './submodules/companySettings/companySetting.module';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyEntity]), CompanySettingModule],
  controllers: [CompanyController],
  providers: [CompanyNestCrudService, CreateCompanyService],
  exports: [CompanyNestCrudService],
})
export class CompanyModule {}
