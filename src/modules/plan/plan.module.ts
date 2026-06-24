import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanEntity } from './plan.entity';
import { PlanController } from './plan.controller';
import { PlanNestCrudService } from './domain/planNestCrud.service';

@Module({
  imports: [TypeOrmModule.forFeature([PlanEntity])],
  providers: [PlanNestCrudService],
  controllers: [PlanController],
})
export class PlanModule {}
