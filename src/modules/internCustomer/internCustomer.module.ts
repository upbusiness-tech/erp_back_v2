import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InternCustomerEntity } from './internCustomer.entity';
import { InternCustomerPriceModule } from './submodules/internCustomerPrice/internCustomerPrice.module';
import { InternCustomerDataUiService } from './domain/internCustomerDataUi.service';
import { InternCustomerController } from './internCustomer.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([InternCustomerEntity]),
    InternCustomerPriceModule,
  ],
  controllers: [InternCustomerController],
  providers: [InternCustomerDataUiService],
  exports: [InternCustomerDataUiService],
})
export class InternCustomerModule {}
