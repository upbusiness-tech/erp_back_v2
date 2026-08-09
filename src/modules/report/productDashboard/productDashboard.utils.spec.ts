import { BadRequestException } from '@nestjs/common';
import {
  PRODUCT_DASHBOARD_DEFAULT_LIMIT,
  PRODUCT_DASHBOARD_MAX_LIMIT,
  PRODUCT_DASHBOARD_MAX_RANGE_DAYS,
} from './productDashboard.constants';
import {
  normalizeProductDashboardDateRange,
  normalizeProductDashboardLimit,
} from './productDashboard.utils';

describe('product dashboard utils', () => {
  describe('normalizeProductDashboardDateRange', () => {
    it('normalizes an inclusive date range to an exclusive database end', () => {
      const result = normalizeProductDashboardDateRange(
        '2026-01-01',
        '2026-01-31',
      );

      expect(result.from).toBe('2026-01-01');
      expect(result.to).toBe('2026-01-31');
      // fromDate is local midnight on Jan 1
      expect(result.fromDate.getHours()).toBe(0);
      expect(result.fromDate.getMinutes()).toBe(0);
      expect(result.fromDate.getDate()).toBe(1);
      expect(result.fromDate.getMonth()).toBe(0);
      // toExclusiveDate is local midnight on Feb 1
      expect(result.toExclusiveDate.getHours()).toBe(0);
      expect(result.toExclusiveDate.getDate()).toBe(1);
      expect(result.toExclusiveDate.getMonth()).toBe(1);
    });

    it('rejects impossible calendar dates', () => {
      expect(() =>
        normalizeProductDashboardDateRange('2026-02-30', '2026-02-30'),
      ).toThrow(BadRequestException);
    });

    it('rejects reversed and excessive ranges', () => {
      expect(() =>
        normalizeProductDashboardDateRange('2026-02-01', '2026-01-01'),
      ).toThrow(BadRequestException);

      expect(() =>
        normalizeProductDashboardDateRange('2024-01-01', '2024-01-01'),
      ).not.toThrow();

      const from = new Date(Date.UTC(2024, 0, 1));
      const to = new Date(
        from.getTime() + PRODUCT_DASHBOARD_MAX_RANGE_DAYS * 24 * 60 * 60 * 1000,
      );
      expect(() =>
        normalizeProductDashboardDateRange(
          from.toISOString().slice(0, 10),
          to.toISOString().slice(0, 10),
        ),
      ).toThrow(BadRequestException);
    });

    it('rejects future dates', () => {
      const future = new Date(Date.now() + 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);

      expect(() => normalizeProductDashboardDateRange(future, future)).toThrow(
        BadRequestException,
      );
    });
  });

  describe('normalizeProductDashboardLimit', () => {
    it('uses the default limit when omitted', () => {
      expect(normalizeProductDashboardLimit(undefined)).toBe(
        PRODUCT_DASHBOARD_DEFAULT_LIMIT,
      );
    });

    it('accepts integer values and rejects unsafe values', () => {
      expect(normalizeProductDashboardLimit('3')).toBe(3);
      expect(() => normalizeProductDashboardLimit('3items')).toThrow(
        BadRequestException,
      );
      expect(() =>
        normalizeProductDashboardLimit(PRODUCT_DASHBOARD_MAX_LIMIT + 1),
      ).toThrow(BadRequestException);
    });
  });
});
