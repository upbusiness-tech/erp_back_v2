import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanEntity } from './plan.entity';
import { PlanController } from './plan.controller';
import { PlanNestCrudService } from './domain/planNestCrud.service';
import { CompanyEntity } from '../company/company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlanEntity, CompanyEntity])],
  providers: [PlanNestCrudService],
  controllers: [PlanController],
})
export class PlanModule {}
