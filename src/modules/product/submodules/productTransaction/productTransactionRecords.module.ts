import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductTransactionRecordsEntity } from './productTransactionRecords.entity';
import { ProductTransactionRecordsDataUiService } from './domain/productTransactionRecordsDataUi.service';
import { ProductTransactionRecordsController } from './productTransactionRecords.controller';
import { ProductEspecificationModule } from '../productEspecification/productEspecification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductTransactionRecordsEntity]),
    ProductEspecificationModule,
  ],
  providers: [ProductTransactionRecordsDataUiService],
  controllers: [ProductTransactionRecordsController],
})
export class ProductTransactionRecordsModule {}
