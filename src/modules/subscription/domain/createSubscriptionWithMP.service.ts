import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';
import { getNextDueDate, getReferenceMonthFromDate } from 'src/common/date';
import { CompanyNestCrudService } from 'src/modules/company/domain/companyNestCrud.service';
import { Repository } from 'typeorm';
import {
  CreatePaymentToMercadoPago,
  EXPIRATION_TIME,
  PAYMENT_TYPES,
  PROCESSING_MODE,
} from '../resources/mercadoPago.resource';
import { SubscriptionEntity } from '../subscription.entity';
import { SubscriptionStatus } from '../subscription.enum';
dotenv.config();

@Injectable()
export class CreateSubscriptionWithMPService {
  private readonly ACCESS_TOKEN: string | undefined = undefined;
  private readonly MP_API_URL: string = 'https://api.mercadopago.com/v1';

  constructor(
    private readonly companyService: CompanyNestCrudService,
    @InjectRepository(SubscriptionEntity)
    private readonly subscriptionRepo: Repository<SubscriptionEntity>,
  ) {
    this.ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  }

  async execute(companyUid: string) {
    const company = await this.companyService.findOne({
      where: {
        uid: companyUid,
      },
      relations: {
        plan: true,
      },
    });

    const plan = company.plan;
    const amountAsString = Number(plan.price).toFixed(2);

    const internalReference = randomUUID();

    const mercadoPagoPaymentBody: CreatePaymentToMercadoPago = {
      type: PAYMENT_TYPES.Online,
      total_amount: amountAsString,
      processing_mode: PROCESSING_MODE.Manual,
      external_reference: internalReference,
      payer: {
        email: company.contactEmail,
      },
      expiration_time: EXPIRATION_TIME.ONE_WEEK,
      items: [
        {
          title: plan.name,
          quantity: 1,
          unit_price: amountAsString,
        },
      ],
      config: {
        online: {
          success_url: 'https://erp-front-v2.vercel.app',
        },
        payment_method: {
          not_allowed_types: ['ticket'],
        },
      },
    };

    const idempotencyKey = randomUUID();
    const paymentResult = await axios.post(
      `${this.MP_API_URL}/orders`,
      mercadoPagoPaymentBody,
      {
        headers: {
          'X-Idempotency-Key': idempotencyKey,
          Authorization: `Bearer ${this.ACCESS_TOKEN}`,
        },
      },
    );

    const paymentCreatedData = paymentResult.data;

    const dueDate = getNextDueDate(company.paymentDay);

    const subscription = await this.subscriptionRepo.save({
      companyUid,
      internalReference,
      externalId: paymentCreatedData.id,
      externalLink: paymentCreatedData.checkout_url,
      status: SubscriptionStatus.PENDING,
      dueDate,
      referenceMonth: getReferenceMonthFromDate(dueDate),
    });

    return {
      subscription,
      mercadoPagoData: paymentCreatedData,
    };
  }
}
