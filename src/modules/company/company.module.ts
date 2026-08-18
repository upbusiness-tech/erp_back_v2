import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyController } from './company.controller';
import { CompanyEntity } from './company.entity';
import { CompanyNestCrudService } from './domain/companyNestCrud.service';
import { CreateCompanyService } from './domain/createCompany.service';
import { CompanySettingModule } from './submodules/companySettings/companySetting.module';
import { ViewCompanyDetailsEntity } from 'src/views/company/viewCompanyDetails.entity';
import { ViewCompanyDetailsService } from './domain/viewCompanyDetails.service';
import { CompanyAuthModule } from 'src/auth/submodules/companyAuth/companyAuth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CompanyEntity, ViewCompanyDetailsEntity]),
    CompanySettingModule,
    CompanyAuthModule,
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
