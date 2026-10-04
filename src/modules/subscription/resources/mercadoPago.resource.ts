export enum PAYMENT_TYPES {
  Online = 'online',
}

export enum PROCESSING_MODE {
  Manual = 'manual',
}

export enum EXPIRATION_TIME {
  ONE_DAY = 'P1D',
  ONE_WEEK = 'P7D',
}

export type PaymentItemMercadoPago = {
  title: string;
  unit_price: string;
  quantity: number;
  unit_measure?: string;
  total_amount?: string;
};

export interface CreatePaymentToMercadoPago {
  type: PAYMENT_TYPES;
  total_amount: string;
  external_reference?: string;
  expiration_time?: EXPIRATION_TIME;
  processing_mode: PROCESSING_MODE;
  capture_mode?: string;
  items: PaymentItemMercadoPago[];
  payer: {
    email: string;
  };
  config: {
    online: {
      success_url: string;
    };
    payment_method: {
      not_allowed_types: string[];
    };
  };
}
export interface WebHookDefaultFields {
  action: string;
  api_version: string;
  application_id: string;
  data: {
    currency_id: string;
    external_reference: string;
    id: string;
    items: [];
    status: string;
    status_detail: string;
    total_amount: string;
    transactions: [];
    type: 'online';
    version: number;
  };
  date_created: string;
  live_mode: boolean;
  type: string;
  user_id: string;
}
