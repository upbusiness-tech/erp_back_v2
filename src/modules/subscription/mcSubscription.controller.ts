import { Body, Controller, Post } from '@nestjs/common';
import { SubscriptionDataUiService } from './domain/subscriptionDataUi.service';

@Controller('mercado-pago')
export class MCSubscriptionController {
  constructor(public service: SubscriptionDataUiService) {}

  @Post('payments-webhook')
  async receivePayment(@Body() payload: any) {
    await this.service.interceptPayment(payload);
  }
}
