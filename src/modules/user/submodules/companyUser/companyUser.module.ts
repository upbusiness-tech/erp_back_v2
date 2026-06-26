import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyUserController } from './companyUser.controller';
import { CompanyUserEntity } from './companyUser.entity';
import { CompanyUserDataUiService } from './domain/companyUserDataUi.service';
import { CreateCompanyUserService } from './domain/createCompanyUser.service';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyUserEntity])],
  controllers: [CompanyUserController],
  providers: [CompanyUserDataUiService, CreateCompanyUserService],
})
export class CompanyUserModule {}
