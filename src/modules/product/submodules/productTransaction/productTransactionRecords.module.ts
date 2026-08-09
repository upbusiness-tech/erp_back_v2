import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEspecificationModule } from '../productEspecification/productEspecification.module';
import { ProductTransactionRecordsDataUiService } from './domain/productTransactionRecordsDataUi.service';
import { ProductTransactionRecordsController } from './productTransactionRecords.controller';
import { ProductTransactionRecordsEntity } from './productTransactionRecords.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductTransactionRecordsEntity]),
    ProductEspecificationModule,
  ],
  providers: [ProductTransactionRecordsDataUiService],
  controllers: [ProductTransactionRecordsController],
})
export class ProductTransactionRecordsModule {}
