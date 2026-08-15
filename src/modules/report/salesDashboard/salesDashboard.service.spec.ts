import { DataSource } from 'typeorm';
import { PaymentMethod } from 'src/modules/sale/submodules/salePayment/salePayment.enum';
import { SaleType } from 'src/modules/sale/sale.enum';
import { SalesDashboardService } from './salesDashboard.service';

function createMockQueryBuilder() {
  const builder: Record<string, jest.Mock> = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    addGroupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    setParameters: jest.fn().mockReturnThis(),
    getQuery: jest.fn().mockReturnValue('(eligible-sales)'),
    getParameters: jest.fn().mockReturnValue({}),
    getRawOne: jest.fn(),
    getRawMany: jest.fn(),
  };
  return builder;
}

describe('SalesDashboardService', () => {
  it('rejects invalid input without querying the database', async () => {
    const dataSource = {
      createQueryBuilder: jest.fn(),
    } as unknown as DataSource;
    const service = new SalesDashboardService(dataSource);

    await expect(
      service.getDashboard(
        { from: '2026-02-30', to: '2026-02-30' },
        'company-a',
      ),
    ).rejects.toThrow();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(dataSource.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('aggregates selected payments without duplicating split-payment sales', async () => {
    const eligible = createMockQueryBuilder();
    const perSale = createMockQueryBuilder();
    const summary = createMockQueryBuilder();
    const breakdown = createMockQueryBuilder();

    summary.getRawOne.mockResolvedValue({
      filteredSales: '2',
      total: '150.00',
    });
    breakdown.getRawMany.mockResolvedValue([
      { type: PaymentMethod.PIX, amount: '100.00' },
      { type: PaymentMethod.CREDIT, amount: '50.00' },
    ]);

    const dataSource = {
      createQueryBuilder: jest
        .fn()
        .mockReturnValueOnce(eligible)
        .mockReturnValueOnce(perSale)
        .mockReturnValueOnce(summary)
        .mockReturnValueOnce(breakdown),
    } as unknown as DataSource;
    const service = new SalesDashboardService(dataSource);

    const result = await service.getDashboard(
      {
        from: '2026-01-01',
        to: '2026-01-31',
        paymentType: [PaymentMethod.PIX, PaymentMethod.CREDIT],
        saleType: [SaleType.NORMAL, SaleType.PDV],
        customerName: ' Maria ',
        saleCode: '123',
      },
      'company-a',
    );

    expect(result).toEqual({
      period: { from: '2026-01-01', to: '2026-01-31' },
      filters: {
        paymentType: [PaymentMethod.PIX, PaymentMethod.CREDIT],
        saleType: [SaleType.NORMAL, SaleType.PDV],
        customerName: 'Maria',
        saleCode: '123',
      },
      summary: { filteredSales: 2, total: 150 },
      paymentBreakdown: [
        { type: PaymentMethod.PIX, amount: 100 },
        { type: PaymentMethod.CREDIT, amount: 50 },
      ],
    });

    expect(
      eligible.andWhere.mock.calls.some(
        ([sql]: [string]) =>
          sql.includes('EXISTS') && sql.includes('paymentTypes'),
      ),
    ).toBe(true);
    expect(
      eligible.andWhere.mock.calls.some(([sql]: [string]) =>
        sql.includes('s.type IN (:...saleTypes)'),
      ),
    ).toBe(true);
    expect(perSale.innerJoin.mock.calls[0][2]).toContain(
      'sp.type IN (:...paymentTypes)',
    );
    expect(eligible.innerJoin).toHaveBeenCalledWith(
      'intern_customers',
      'ic',
      expect.stringContaining('ic.id = s."internCustomerId"'),
    );
    expect(
      eligible.andWhere.mock.calls.some(([sql]: [string]) =>
        sql.includes('ic.name ILIKE :customerName'),
      ),
    ).toBe(true);
    expect(
      eligible.andWhere.mock.calls.some(([sql]: [string]) =>
        sql.includes('s.code ILIKE :saleCode'),
      ),
    ).toBe(true);
  });

  it('deducts sale change only from the cash payment aggregate', async () => {
    const eligible = createMockQueryBuilder();
    const perSale = createMockQueryBuilder();
    const summary = createMockQueryBuilder();
    const breakdown = createMockQueryBuilder();

    summary.getRawOne.mockResolvedValue({
      filteredSales: '1',
      total: '597.00',
    });
    breakdown.getRawMany.mockResolvedValue([
      { type: PaymentMethod.CASH, amount: '597.00' },
    ]);

    const dataSource = {
      createQueryBuilder: jest
        .fn()
        .mockReturnValueOnce(eligible)
        .mockReturnValueOnce(perSale)
        .mockReturnValueOnce(summary)
        .mockReturnValueOnce(breakdown),
    } as unknown as DataSource;
    const service = new SalesDashboardService(dataSource);

    const result = await service.getDashboard(
      {
        from: '2026-01-01',
        to: '2026-01-31',
        paymentType: [PaymentMethod.CASH],
      },
      'company-a',
    );

    expect(result.summary).toEqual({ filteredSales: 1, total: 597 });
    expect(result.paymentBreakdown).toEqual([
      { type: PaymentMethod.CASH, amount: 597 },
    ]);
    expect(eligible.addSelect).toHaveBeenCalledWith('s."change"', 'change');
    expect(perSale.addSelect).toHaveBeenCalledWith(
      'COALESCE(eligible."change", 0)',
      'change',
    );
    expect(
      summary.addSelect.mock.calls.some(([sql]: [string]) =>
        sql.includes('GREATEST(ps.amount - ps."change", 0)'),
      ),
    ).toBe(true);
    expect(
      breakdown.addSelect.mock.calls.some(([sql]: [string]) =>
        sql.includes('GREATEST(ps.amount - ps."change", 0)'),
      ),
    ).toBe(true);
  });

  it('returns zero values and an empty breakdown when no rows match', async () => {
    const eligible = createMockQueryBuilder();
    const perSale = createMockQueryBuilder();
    const summary = createMockQueryBuilder();
    const breakdown = createMockQueryBuilder();
    summary.getRawOne.mockResolvedValue({ filteredSales: '0', total: '0' });
    breakdown.getRawMany.mockResolvedValue([]);

    const dataSource = {
      createQueryBuilder: jest
        .fn()
        .mockReturnValueOnce(eligible)
        .mockReturnValueOnce(perSale)
        .mockReturnValueOnce(summary)
        .mockReturnValueOnce(breakdown),
    } as unknown as DataSource;
    const service = new SalesDashboardService(dataSource);

    const result = await service.getDashboard(
      { from: '2026-01-01', to: '2026-01-31' },
      'company-a',
    );

    expect(result.summary).toEqual({ filteredSales: 0, total: 0 });
    expect(result.paymentBreakdown).toEqual([]);
  });
});
