import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashFlowEntity } from './cashFlow.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CashFlowEntity])],
})
export class CashFlowModule {}
