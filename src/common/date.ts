import { format, startOfDay } from 'date-fns';

export const getFirstPaymentDate = (payday: number) => {
  const today = startOfDay(new Date());
  const daysInMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0,
  ).getDate();
  return new Date(
    today.getFullYear(),
    today.getMonth(),
    Math.min(payday, daysInMonth),
  );
};

export const getNextDueDate = (payday: number, from: Date = new Date()) => {
  const base = startOfDay(from);
  const year = base.getFullYear();
  const month = base.getMonth();

  const daysInThisMonth = new Date(year, month + 1, 0).getDate();
  const thisMonthDue = new Date(year, month, Math.min(payday, daysInThisMonth));

  if (thisMonthDue >= base) {
    return thisMonthDue;
  }

  const nextMonthIndex = (month + 1) % 12;
  const nextYear = month === 11 ? year + 1 : year;
  const daysInNextMonth = new Date(nextYear, nextMonthIndex + 1, 0).getDate();

  return new Date(nextYear, nextMonthIndex, Math.min(payday, daysInNextMonth));
};

export const getReferenceMonthFromDate = (date: Date) =>
  format(date, 'yyyy-MM');