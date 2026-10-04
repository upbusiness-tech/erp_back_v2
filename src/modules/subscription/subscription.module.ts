import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionDataUiService } from './domain/subscriptionDataUi.service';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionEntity } from './subscription.entity';
import { CompanyModule } from '../company/company.module';
import { CreateSubscriptionWithMPService } from './domain/createSubscriptionWithMP.service';
import { CompanyEntity } from '../company/company.entity';
import { MCSubscriptionController } from './mcSubscription.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([SubscriptionEntity, CompanyEntity]),
    forwardRef(() => CompanyModule),
  ],
  controllers: [SubscriptionController, MCSubscriptionController],
  providers: [SubscriptionDataUiService, CreateSubscriptionWithMPService],
  exports: [SubscriptionDataUiService, CreateSubscriptionWithMPService],
})
export class SubscriptionModule {}
