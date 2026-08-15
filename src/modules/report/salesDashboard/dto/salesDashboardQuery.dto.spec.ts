import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PaymentMethod } from 'src/modules/sale/submodules/salePayment/salePayment.enum';
import { SaleType } from 'src/modules/sale/sale.enum';
import { SalesDashboardQueryDto } from './salesDashboardQuery.dto';

describe('SalesDashboardQueryDto', () => {
  it('normalizes repeated query parameters into lists', async () => {
    const query = plainToInstance(SalesDashboardQueryDto, {
      from: '2026-01-01',
      to: '2026-01-31',
      paymentType: [PaymentMethod.PIX, PaymentMethod.CREDIT],
      saleType: [SaleType.NORMAL, SaleType.PDV],
    });

    expect(await validate(query)).toHaveLength(0);
    expect(query.paymentType).toEqual([
      PaymentMethod.PIX,
      PaymentMethod.CREDIT,
    ]);
    expect(query.saleType).toEqual([SaleType.NORMAL, SaleType.PDV]);
  });

  it('normalizes a single filter value and rejects invalid enums', async () => {
    const query = plainToInstance(SalesDashboardQueryDto, {
      from: '2026-01-01',
      to: '2026-01-31',
      paymentType: PaymentMethod.PIX,
      saleType: 'INVALID',
    });

    const errors = await validate(query);

    expect(query.paymentType).toEqual([PaymentMethod.PIX]);
    expect(errors.map((error) => error.property)).toContain('saleType');
  });
});
