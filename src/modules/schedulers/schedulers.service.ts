import { Injectable } from '@nestjs/common';
import { SubscriptionDataUiService } from '../subscription/domain/subscriptionDataUi.service';

@Injectable()
export class SchedulersService {
  constructor(
    private readonly subscriptionService: SubscriptionDataUiService,
  ) {}

  async createMonthlySubscription() {
    return await this.subscriptionService.getCompanysToSubcribeToday();
  }
}
