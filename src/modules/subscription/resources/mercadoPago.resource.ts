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
