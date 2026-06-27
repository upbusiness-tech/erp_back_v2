import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyEntity } from './company.entity';
import { CompanyController } from './company.controller';
import { CompanyNestCrudService } from './domain/companyNestCrud.service';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyEntity])],
  controllers: [CompanyController],
  providers: [CompanyNestCrudService],
  exports: [CompanyNestCrudService],
})
export class CompanyModule {}
