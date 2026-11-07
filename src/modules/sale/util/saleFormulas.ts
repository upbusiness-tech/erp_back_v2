import { CreateSalePaymentDto } from '../dto/createSale.dto';
import { SaleSummary } from '../types/sale.types';
import { SaleEntity } from '../sale.entity';
import { SaleItemEntity } from '../submodules/saleItem/saleItem.entity';
import { SaleServiceEntity } from '../submodules/saleService/saleService.entity';

export const toCents = (value: number | null | undefined): number =>
  Math.round((value ?? 0) * 100);

export const fromCents = (value: number): number => value / 100;

export const round2 = (value: number): number => fromCents(toCents(value));

export const hasInsufficientPayment = (paid: number, total: number): boolean =>
  toCents(paid) < toCents(total);

export const resolveItemUnitPrice = (item: SaleItemEntity): number =>
  item.isEspecialPrice && item.specialPriceSnapshot != null
    ? item.specialPriceSnapshot
    : item.salePriceSnapshot;

export const calculateItemLine = (item: SaleItemEntity) => {
  const unitPrice = resolveItemUnitPrice(item);

  const gross = round2((unitPrice ?? 0) * item.quantitySold * item.unitSold);
  const discount = round2(item.discountInfo?.value ?? 0);
  const net = round2(gross - discount);

  return { gross, discount, net };
};

export const calculateItemAmounts = (item: SaleItemEntity) => {
  const amountItem = calculateItemLine(item).net;
  const costAmount = round2(
    (item.costPriceSnapshot ?? 0) * item.quantitySold * item.unitSold,
  );
  const amountProfitItem = round2(amountItem - costAmount);

  return { amountItem, costAmount, amountProfitItem };
};

export const allocateSaleDiscountShares = (
  bases: number[],
  saleDiscount: number,
): number[] => {
  const normalizedBases = bases.map((base) => round2(base));
  const normalizedDiscount = round2(saleDiscount);
  const totalBase = round2(
    normalizedBases.reduce((total, base) => total + base, 0),
  );

  if (normalizedDiscount <= 0 || totalBase <= 0) {
    return normalizedBases.map(() => 0);
  }

  const shares = normalizedBases.map((base) =>
    round2((normalizedDiscount * base) / totalBase),
  );
  const residual = round2(
    normalizedDiscount - shares.reduce((total, share) => total + share, 0),
  );

  if (residual !== 0) {
    const largestBaseIndex = normalizedBases.reduce(
      (largestIndex, base, index) =>
        base > normalizedBases[largestIndex] ? index : largestIndex,
      0,
    );
    shares[largestBaseIndex] = round2(shares[largestBaseIndex] + residual);
  }

  return shares;
};

export const calculateSaleItems = (items: SaleItemEntity[]) => {
  const totals = items.reduce(
    (acc, item) => {
      const { gross, discount, net } = calculateItemLine(item);
      return {
        grossCents: acc.grossCents + toCents(gross),
        discountCents: acc.discountCents + toCents(discount),
        netCents: acc.netCents + toCents(net),
      };
    },
    { grossCents: 0, discountCents: 0, netCents: 0 },
  );

  return {
    gross: fromCents(totals.grossCents),
    discounts: fromCents(totals.discountCents),
    net: fromCents(totals.netCents),
  };
};

export const calculateServiceLine = (service: SaleServiceEntity) => {
  const gross = round2(service.amount);
  const discount = round2(service.discount?.value ?? 0);
  const net = round2(gross - discount);

  return { gross, discount, net };
};

export const calculateSaleServices = (services: SaleServiceEntity[]) => {
  const totals = services.reduce(
    (acc, service) => {
      const { gross, discount, net } = calculateServiceLine(service);
      return {
        grossCents: acc.grossCents + toCents(gross),
        discountCents: acc.discountCents + toCents(discount),
        netCents: acc.netCents + toCents(net),
      };
    },
    { grossCents: 0, discountCents: 0, netCents: 0 },
  );

  return {
    gross: fromCents(totals.grossCents),
    discounts: fromCents(totals.discountCents),
    net: fromCents(totals.netCents),
  };
};

export const calculateSalePayments = (payments: CreateSalePaymentDto[]) => {
  const totalCents = payments.reduce(
    (acc, payment) => acc + toCents(payment.amount),
    0,
  );

  return fromCents(totalCents);
};

export const calculateSaleTotals = (
  sale: Pick<SaleEntity, 'discount'>,
  items: SaleItemEntity[],
  services: SaleServiceEntity[],
  payments: CreateSalePaymentDto[],
) => {
  const itemsResult = calculateSaleItems(items);
  const servicesResult = calculateSaleServices(services);

  const subtotalCents = toCents(itemsResult.net) + toCents(servicesResult.net);
  const saleDiscount = round2(sale.discount?.value ?? 0);
  const totalCents = subtotalCents - toCents(saleDiscount);
  const total = fromCents(totalCents);
  const paid = calculateSalePayments(payments);
  const change = fromCents(toCents(paid) - totalCents);
  const subtotal = fromCents(subtotalCents);

  const summary: SaleSummary = {
    items: itemsResult.gross,
    services: servicesResult.gross,
    itemDiscounts: itemsResult.discounts,
    serviceDiscounts: servicesResult.discounts,
    subtotal,
    saleDiscount,
    total,
    paid,
    change,
  };

  return {
    items: itemsResult,
    services: servicesResult,
    subtotal,
    saleDiscount,
    total,
    paid,
    change,
    summary,
  };
};
