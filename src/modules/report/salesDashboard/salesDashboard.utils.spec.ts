import { BadRequestException } from '@nestjs/common';
import { normalizeSalesDashboardDateRange } from './salesDashboard.utils';

describe('normalizeSalesDashboardDateRange', () => {
  it('returns an inclusive period with an exclusive end date', () => {
    const result = normalizeSalesDashboardDateRange('2026-01-01', '2026-01-31');

    expect(result.from).toBe('2026-01-01');
    expect(result.to).toBe('2026-01-31');
    expect(result.toExclusiveDate.getDate()).toBe(1);
    expect(result.toExclusiveDate.getMonth()).toBe(1);
  });

  it('rejects malformed, impossible, reversed, future, and excessive ranges', () => {
    expect(() =>
      normalizeSalesDashboardDateRange('2026-02-30', '2026-02-30'),
    ).toThrow(BadRequestException);
    expect(() =>
      normalizeSalesDashboardDateRange('2026-02-02', '2026-02-01'),
    ).toThrow(BadRequestException);
    expect(() =>
      normalizeSalesDashboardDateRange('2026-01-01', '2026-12-31'),
    ).toThrow(BadRequestException);
    expect(() =>
      normalizeSalesDashboardDateRange('2024-01-01', '2026-01-01'),
    ).toThrow(BadRequestException);
  });
});
