import { Module } from '@nestjs/common';
import { SchedulersController } from './schedulers.controller';
import { SchedulersService } from './schedulers.service';
import { SubscriptionModule } from '../subscription/subscription.module';

@Module({
  controllers: [SchedulersController],
  providers: [SchedulersService],
  exports: [SchedulersService],
  imports: [SubscriptionModule],
})
export class SchedulersModule {}
