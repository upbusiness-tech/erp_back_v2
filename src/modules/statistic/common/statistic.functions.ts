import { BadRequestException } from '@nestjs/common';
import { StatisticDateRage } from './statistic.types';

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
// const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export function normalizeStatisticDateRange(
  from: unknown,
  to: unknown,
): StatisticDateRage {
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

  // const rangeDays =
  //   Math.floor((toDate.getTime() - fromDate.getTime()) / MILLISECONDS_PER_DAY) +
  //   1;
  // if (rangeDays > PRODUCT_DASHBOARD_MAX_RANGE_DAYS) {
  //   throw new BadRequestException(
  //     `O período não pode exceder ${PRODUCT_DASHBOARD_MAX_RANGE_DAYS} dias`,
  //   );
  // }

  return {
    from,
    to,
    fromDate,
    toExclusiveDate: dayAfterLocal(toDate),
  };
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
