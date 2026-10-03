import { Controller, Get } from '@nestjs/common';
import { SchedulersService } from './schedulers.service';

@Controller('schedulers')
export class SchedulersController {
  constructor(private readonly schedulersService: SchedulersService) {}

  @Get('create-subscription')
  async createSubscription() {
    return await this.schedulersService.createMonthlySubscription();
  }
}
