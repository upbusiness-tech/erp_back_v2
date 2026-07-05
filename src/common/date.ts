import { startOfDay } from 'date-fns';

export const getFirstPaymentDate = (payday: number) => {
  const today = startOfDay(new Date());
  const dueDate = new Date(
    `${today.getFullYear()}-${today.getMonth()}-${payday}`,
  );
  return dueDate;
};
