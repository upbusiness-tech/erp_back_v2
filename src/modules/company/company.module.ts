import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyEntity } from './company.entity';
import { CompanyController } from './company.controller';
import { CompanyNestCrudService } from './domain/companyNestCrud.service';
import { CreateCompanyService } from './domain/createCompany.service';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyEntity])],
  controllers: [CompanyController],
  providers: [CompanyNestCrudService, CreateCompanyService],
  exports: [CompanyNestCrudService],
})
export class CompanyModule {}
