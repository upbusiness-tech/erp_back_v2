import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class CloudSchedulerGuard implements CanActivate {
  private readonly SCHEDULER_KEY: string;

  constructor() {
    this.SCHEDULER_KEY = process.env.CLOUD_SCHEDULER_KEY;
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const scheduleKey = request.headers['x-scheduler-key'] as string;

    if (scheduleKey != this.SCHEDULER_KEY)
      throw new UnauthorizedException('Cloud Scheduler Key doesnt match');

    return true;
  }
}
