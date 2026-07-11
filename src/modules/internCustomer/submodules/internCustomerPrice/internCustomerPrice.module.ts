import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InternCustomerPriceEntity } from './internCustomerPrice.entity';
import { InternCustomerPriceDataUiService } from './domain/internCustomerPriceDataUi.service';
import { InternCustomerPriceController } from './internCustomerPrice.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InternCustomerPriceEntity])],
  controllers: [InternCustomerPriceController],
  providers: [InternCustomerPriceDataUiService],
  exports: [InternCustomerPriceDataUiService],
})
export class InternCustomerPriceModule {}
