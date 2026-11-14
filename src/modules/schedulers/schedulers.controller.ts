import { Controller, Get, UseGuards } from '@nestjs/common';
import { SchedulersService } from './schedulers.service';
import { CloudSchedulerGuard } from 'src/auth/guards/cloudScheduler.guard';

@Controller('schedulers')
@UseGuards(CloudSchedulerGuard)
export class SchedulersController {
  constructor(private readonly schedulersService: SchedulersService) {}

  @Get('create-subscription')
  async createSubscription() {
    return await this.schedulersService.createMonthlySubscription();
  }

  @Get('check-overdue')
  async checkOverdue() {
    return await this.schedulersService.checkOverdue();
  }
}
