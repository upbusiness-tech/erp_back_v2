import { Module } from '@nestjs/common';
import { PlanEntity } from './plan.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({ imports: [TypeOrmModule.forFeature([PlanEntity])] })
export class PlanModule {}
