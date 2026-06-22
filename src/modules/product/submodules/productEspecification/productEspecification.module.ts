import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEspecificationEntity } from './productEspecification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEspecificationEntity])],
})
export class ProductEspecificationModule {}
