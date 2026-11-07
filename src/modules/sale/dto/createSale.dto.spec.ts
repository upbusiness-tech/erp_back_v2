import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate, ValidatorOptions } from 'class-validator';
import { InternCustomerType } from 'src/modules/internCustomer/internCustomer.enum';
import { ProductUnitOfMeasure } from 'src/modules/product/product.enum';
import { SaleType } from '../sale.enum';
import { PaymentMethod } from '../submodules/salePayment/salePayment.enum';
import { CreateSaleDto } from './createSale.dto';

interface SalePayload {
  type: SaleType;
  cashFlowId: number;
  items: Array<Record<string, unknown>>;
  payments: Array<Record<string, unknown>>;
}

const buildValidPayload = (): SalePayload => ({
  type: SaleType.NORMAL,
  cashFlowId: 1,
  items: [
    {
      productId: 1,
      productEspecificationId: 1,
      quantitySold: 2,
      unitSold: 1,
      unitOfMeasure: ProductUnitOfMeasure.UNIT,
    },
  ],
  payments: [{ type: PaymentMethod.CASH, amount: 100 }],
});

const validateDto = (payload: object, options?: ValidatorOptions) =>
  validate(plainToInstance(CreateSaleDto, payload), options);

describe('CreateSaleDto', () => {
  it('requires name when isolatedCustomer is provided', async () => {
    const payload = {
      ...buildValidPayload(),
      isolatedCustomer: { type: InternCustomerType.INDIVIDUAL },
    };

    const errors = await validateDto(payload);

    expect(errors.some((error) => error.property === 'isolatedCustomer')).toBe(
      true,
    );
  });

  it('rejects unknown fields inside isolatedCustomer', async () => {
    const payload = {
      ...buildValidPayload(),
      isolatedCustomer: { name: 'Cliente Avulso', unknownField: 'x' },
    };

    const errors = await validateDto(payload, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    expect(errors.some((error) => error.property === 'isolatedCustomer')).toBe(
      true,
    );
  });

  it('accepts an isolatedCustomer with only name', async () => {
    const payload = {
      ...buildValidPayload(),
      isolatedCustomer: { name: 'Cliente Avulso' },
    };

    await expect(validateDto(payload)).resolves.toHaveLength(0);
  });

  it('accepts an item without isEspecialPrice and with specialPrice', async () => {
    const payloadWithoutEspecialFlag = buildValidPayload();
    await expect(validateDto(payloadWithoutEspecialFlag)).resolves.toHaveLength(
      0,
    );

    const payloadWithSpecialPrice = buildValidPayload();
    payloadWithSpecialPrice.items[0] = {
      ...payloadWithSpecialPrice.items[0],
      specialPrice: 28,
    };

    await expect(validateDto(payloadWithSpecialPrice)).resolves.toHaveLength(0);
  });

  it('accepts a payment with amount equal to zero', async () => {
    const payload = buildValidPayload();
    payload.payments = [{ type: PaymentMethod.CASH, amount: 0 }];

    await expect(validateDto(payload)).resolves.toHaveLength(0);
  });

  it('rejects a payment with negative amount', async () => {
    const payload = buildValidPayload();
    payload.payments = [{ type: PaymentMethod.CASH, amount: -1 }];

    const errors = await validateDto(payload);

    expect(errors.some((error) => error.property === 'payments')).toBe(true);
  });

  it('rejects specialPrice equal to zero or negative', async () => {
    for (const specialPrice of [0, -5]) {
      const payload = buildValidPayload();
      payload.items[0] = {
        ...payload.items[0],
        specialPrice,
      };

      const errors = await validateDto(payload);

      expect(errors.some((error) => error.property === 'items')).toBe(true);
    }
  });
});
