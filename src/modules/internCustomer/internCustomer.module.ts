import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyModule } from '../company/company.module';
import { UserModule } from '../user/user.module';
import { CreateInternCustomerService } from './domain/createInternCustomer.service';
import { InternCustomerDataUiService } from './domain/internCustomerDataUi.service';
import { UpdateInternCustomerService } from './domain/updateInternCustomer.service';
import { InternCustomerController } from './internCustomer.controller';
import { InternCustomerEntity } from './internCustomer.entity';
import { InternCustomerPriceEntity } from './submodules/internCustomerPrice/internCustomerPrice.entity';
import { InternCustomerPriceModule } from './submodules/internCustomerPrice/internCustomerPrice.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([InternCustomerEntity, InternCustomerPriceEntity]),
    InternCustomerPriceModule,
    CompanyModule,
    UserModule,
  ],
  controllers: [InternCustomerController],
  providers: [
    InternCustomerDataUiService,
    CreateInternCustomerService,
    UpdateInternCustomerService,
  ],
  exports: [InternCustomerDataUiService],
})
export class InternCustomerModule {}
