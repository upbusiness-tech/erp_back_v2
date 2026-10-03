import { startOfDay } from 'date-fns';

export const getFirstPaymentDate = (payday: number) => {
  const today = startOfDay(new Date());
  const dueDate = new Date(
    `${today.getFullYear()}-${today.getMonth()}-${payday}`,
  );
  return dueDate;
};

export const getReferenceMonth = () => {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  return `${today.getFullYear()}-${month}`;
};
