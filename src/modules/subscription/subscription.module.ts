import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionDataUiService } from './domain/subscriptionDataUi.service';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionEntity } from './subscription.entity';
import { CompanyModule } from '../company/company.module';

@Module({
  imports: [TypeOrmModule.forFeature([SubscriptionEntity]), CompanyModule],
  controllers: [SubscriptionController],
  providers: [SubscriptionDataUiService],
  exports: [SubscriptionDataUiService],
})
export class SubscriptionModule {}
