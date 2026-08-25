import { CreateSalePaymentDto } from '../dto/createSale.dto';
import { SaleSummary } from '../types/sale.types';
import { SaleEntity } from '../sale.entity';
import { SaleItemEntity } from '../submodules/saleItem/saleItem.entity';
import { SaleServiceEntity } from '../submodules/saleService/saleService.entity';

const round2 = (value: number): number => Math.round(value * 100) / 100;

export const calculateItemLine = (item: SaleItemEntity) => {
  const unitPrice =
    item.isEspecialPrice && item.specialPriceSnapshot != null
      ? item.specialPriceSnapshot
      : item.salePriceSnapshot;

  const gross = round2((unitPrice ?? 0) * item.quantitySold * item.unitSold);
  const discount = round2(item.discountInfo?.value ?? 0);
  const net = round2(gross - discount);

  return { gross, discount, net };
};

export const calculateSaleItems = (items: SaleItemEntity[]) => {
  return items.reduce(
    (acc, item) => {
      const { gross, discount, net } = calculateItemLine(item);
      return {
        gross: round2(acc.gross + gross),
        discounts: round2(acc.discounts + discount),
        net: round2(acc.net + net),
      };
    },
    { gross: 0, discounts: 0, net: 0 },
  );
};

export const calculateServiceLine = (service: SaleServiceEntity) => {
  const gross = round2(service.amount);
  const discount = round2(service.discount?.value ?? 0);
  const net = round2(gross - discount);

  return { gross, discount, net };
};

export const calculateSaleServices = (services: SaleServiceEntity[]) => {
  return services.reduce(
    (acc, service) => {
      const { gross, discount, net } = calculateServiceLine(service);
      return {
        gross: round2(acc.gross + gross),
        discounts: round2(acc.discounts + discount),
        net: round2(acc.net + net),
      };
    },
    { gross: 0, discounts: 0, net: 0 },
  );
};

export const calculateSalePayments = (payments: CreateSalePaymentDto[]) => {
  return payments.reduce((acc, payment) => {
    return round2(acc + payment.amount);
  }, 0);
};

export const calculateSaleTotals = (
  sale: Pick<SaleEntity, 'discount'>,
  items: SaleItemEntity[],
  services: SaleServiceEntity[],
  payments: CreateSalePaymentDto[],
) => {
  const itemsResult = calculateSaleItems(items);
  const servicesResult = calculateSaleServices(services);

  const subtotal = round2(itemsResult.net + servicesResult.net);
  const saleDiscount = round2(sale.discount?.value ?? 0);
  const total = round2(subtotal - saleDiscount);
  const paid = calculateSalePayments(payments);
  const change = round2(paid - total);

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
