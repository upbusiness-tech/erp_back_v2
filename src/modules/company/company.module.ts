import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyController } from './company.controller';
import { CompanyEntity } from './company.entity';
import { CompanyNestCrudService } from './domain/companyNestCrud.service';
import { CreateCompanyService } from './domain/createCompany.service';
import { CompanySettingModule } from './submodules/companySettings/companySetting.module';
import { ViewCompanyDetailsEntity } from 'src/views/company/viewCompanyDetails.entity';
import { ViewCompanyDetailsService } from './domain/viewCompanyDetails.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CompanyEntity, ViewCompanyDetailsEntity]),
    CompanySettingModule,
  ],
  controllers: [CompanyController],
  providers: [
    CompanyNestCrudService,
    CreateCompanyService,
    ViewCompanyDetailsService,
  ],
  exports: [CompanyNestCrudService],
})
export class CompanyModule {}
