import { BadRequestException } from '@nestjs/common';
import {
  PRODUCT_DASHBOARD_DEFAULT_LIMIT,
  PRODUCT_DASHBOARD_MAX_LIMIT,
  PRODUCT_DASHBOARD_MAX_RANGE_DAYS,
} from './productDashboard.constants';
import type { ProductDashboardDateRange } from './productDashboard.types';

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export function normalizeProductDashboardDateRange(
  from: unknown,
  to: unknown,
): ProductDashboardDateRange {
  if (
    typeof from !== 'string' ||
    typeof to !== 'string' ||
    !DATE_ONLY_PATTERN.test(from) ||
    !DATE_ONLY_PATTERN.test(to)
  ) {
    throw new BadRequestException(
      'from e to devem estar no formato YYYY-MM-DD',
    );
  }

  const fromDate = parseDateOnly(from);
  const toDate = parseDateOnly(to);

  if (fromDate.getTime() > toDate.getTime()) {
    throw new BadRequestException('from não pode ser posterior a to');
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (toDate.getTime() > today.getTime()) {
    throw new BadRequestException('O período não pode conter datas futuras');
  }

  const rangeDays =
    Math.floor((toDate.getTime() - fromDate.getTime()) / MILLISECONDS_PER_DAY) +
    1;
  if (rangeDays > PRODUCT_DASHBOARD_MAX_RANGE_DAYS) {
    throw new BadRequestException(
      `O período não pode exceder ${PRODUCT_DASHBOARD_MAX_RANGE_DAYS} dias`,
    );
  }

  return {
    from,
    to,
    fromDate,
    toExclusiveDate: dayAfterLocal(toDate),
  };
}

export function normalizeProductDashboardLimit(limit: unknown): number {
  if (limit === undefined || limit === null || limit === '') {
    return PRODUCT_DASHBOARD_DEFAULT_LIMIT;
  }

  const parsedLimit = typeof limit === 'number' ? limit : Number(limit);

  if (!Number.isSafeInteger(parsedLimit) || parsedLimit < 1) {
    throw new BadRequestException('limit deve ser um inteiro positivo');
  }

  if (parsedLimit > PRODUCT_DASHBOARD_MAX_LIMIT) {
    throw new BadRequestException(
      `limit não pode exceder ${PRODUCT_DASHBOARD_MAX_LIMIT}`,
    );
  }

  return parsedLimit;
}

function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    throw new BadRequestException(`Data inválida: ${value}`);
  }

  return date;
}

function dayAfterLocal(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
}
