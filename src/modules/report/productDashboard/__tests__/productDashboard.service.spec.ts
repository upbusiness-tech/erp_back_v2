import { DataSource } from 'typeorm';
import { ProductDashboardService } from './productDashboard.service';

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
    addOrderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    setParameter: jest.fn().mockReturnThis(),
    setParameters: jest.fn().mockReturnThis(),
    getQuery: jest.fn().mockReturnValue('(subquery)'),
    getParameters: jest.fn().mockReturnValue({}),
    getRawOne: jest.fn(),
    getRawMany: jest.fn(),
  };
  return builder;
}

describe('ProductDashboardService', () => {
  it('rejects invalid input without querying the database', async () => {
    const dataSource = {
      createQueryBuilder: jest.fn(),
    } as unknown as DataSource;
    const service = new ProductDashboardService(dataSource);

    await expect(
      service.getDashboard(
        { from: '2026-02-30', to: '2026-02-30', limit: 5 },
        'company-a',
      ),
    ).rejects.toThrow();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(dataSource.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('returns a compact dashboard response from bounded aggregate queries', async () => {
    const builder = createMockQueryBuilder();
    builder.getRawOne.mockResolvedValueOnce({
      unitsSold: '10',
      revenue: '100.50',
      zeroStockProducts: '1',
    });
    builder.getRawMany
      .mockResolvedValueOnce([
        {
          productId: '1',
          productName: 'Bermuda Sarja',
          quantitySold: '10',
          revenue: '100.50',
          stockQuantity: '0',
          turnover: '10',
        },
      ])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          productId: '1',
          productName: 'Bermuda Sarja',
          quantitySold: '10',
          revenue: '100.50',
          stockQuantity: '0',
          turnover: '10',
        },
      ]);

    const dataSource = {
      createQueryBuilder: jest.fn().mockReturnValue(builder),
    } as unknown as DataSource;
    const service = new ProductDashboardService(dataSource);

    const result = await service.getDashboard(
      { from: '2026-01-01', to: '2026-01-31', limit: 5 },
      'company-a',
    );

    expect(result).toEqual({
      period: { from: '2026-01-01', to: '2026-01-31' },
      summary: {
        unitsSold: 10,
        revenue: 100.5,
        featuredProduct: {
          productId: 1,
          productName: 'Bermuda Sarja',
          quantitySold: 10,
          revenue: 100.5,
          stockQuantity: 0,
          turnover: 10,
        },
        zeroStockProducts: 1,
      },
      rankings: {
        bestSelling: [expect.any(Object)],
        highestRevenue: [],
        highestTurnover: [],
        urgentRestock: [expect.any(Object)],
      },
    });

    const [companyParam] = builder.where.mock.calls.find(
      ([sql]: [string]) =>
        typeof sql === 'string' && sql.includes('companyUid'),
    ) ?? [{}, {}];
    expect(companyParam).toContain('companyUid');
  });

  it('returns zero summaries and empty rankings when no eligible sales exist', async () => {
    const builder = createMockQueryBuilder();
    builder.getRawOne.mockResolvedValueOnce({
      unitsSold: '0',
      revenue: '0',
      zeroStockProducts: '0',
    });
    builder.getRawMany.mockResolvedValue([]);

    const dataSource = {
      createQueryBuilder: jest.fn().mockReturnValue(builder),
    } as unknown as DataSource;
    const service = new ProductDashboardService(dataSource);

    const result = await service.getDashboard(
      { from: '2026-01-01', to: '2026-01-31', limit: 5 },
      'company-a',
    );

    expect(result.summary).toEqual({
      unitsSold: 0,
      revenue: 0,
      featuredProduct: null,
      zeroStockProducts: 0,
    });
    expect(result.rankings).toEqual({
      bestSelling: [],
      highestRevenue: [],
      highestTurnover: [],
      urgentRestock: [],
    });
  });
});
