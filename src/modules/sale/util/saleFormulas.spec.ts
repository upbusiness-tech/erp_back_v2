import { SaleItemEntity } from '../submodules/saleItem/saleItem.entity';
import { SaleServiceEntity } from '../submodules/saleService/saleService.entity';
import {
  calculateItemLine,
  calculateSaleItems,
  calculateSaleServices,
  calculateSaleTotals,
} from './saleFormulas';

const makeItem = (overrides: Partial<SaleItemEntity> = {}): SaleItemEntity =>
  ({
    quantitySold: 1,
    unitSold: 1,
    isEspecialPrice: false,
    salePriceSnapshot: 100,
    specialPriceSnapshot: null,
    discountInfo: null,
    ...overrides,
  }) as SaleItemEntity;

const makeService = (
  overrides: Partial<SaleServiceEntity> = {},
): SaleServiceEntity =>
  ({
    amount: 50,
    discount: null,
    ...overrides,
  }) as SaleServiceEntity;

describe('saleFormulas', () => {
  describe('calculateItemLine', () => {
    it('should calculate gross and net for a regular price item', () => {
      const item = makeItem({
        salePriceSnapshot: 50,
        quantitySold: 2,
      });

      const result = calculateItemLine(item);

      expect(result.gross).toBe(100);
      expect(result.net).toBe(100);
      expect(result.discount).toBe(0);
    });

    it('should apply special price when isEspecialPrice is true', () => {
      const item = makeItem({
        salePriceSnapshot: 100,
        specialPriceSnapshot: 80,
        isEspecialPrice: true,
        quantitySold: 1,
      });

      const result = calculateItemLine(item);

      expect(result.gross).toBe(80);
      expect(result.net).toBe(80);
    });

    it('should subtract line discount from gross', () => {
      const item = makeItem({
        salePriceSnapshot: 50,
        quantitySold: 2,
        discountInfo: { value: 10 },
      });

      const result = calculateItemLine(item);

      expect(result.gross).toBe(100);
      expect(result.discount).toBe(10);
      expect(result.net).toBe(90);
    });

    it('should fallback to salePriceSnapshot when special price is missing', () => {
      const item = makeItem({
        salePriceSnapshot: 60,
        specialPriceSnapshot: null,
        isEspecialPrice: true,
        quantitySold: 1,
      });

      const result = calculateItemLine(item);

      expect(result.gross).toBe(60);
    });
  });

  describe('calculateSaleItems', () => {
    it('should sum gross, discounts and net of all items', () => {
      const items = [
        makeItem({
          salePriceSnapshot: 50,
          quantitySold: 2,
          discountInfo: { value: 10 },
        }),
        makeItem({
          salePriceSnapshot: 30,
          quantitySold: 1,
          isEspecialPrice: true,
          specialPriceSnapshot: 25,
        }),
      ];

      const result = calculateSaleItems(items);

      expect(result.gross).toBe(125);
      expect(result.discounts).toBe(10);
      expect(result.net).toBe(115);
    });
  });

  describe('calculateSaleServices', () => {
    it('should sum gross, discounts and net of all services', () => {
      const services = [
        makeService({ amount: 80, discount: { value: 15 } }),
        makeService({ amount: 40 }),
      ];

      const result = calculateSaleServices(services);

      expect(result.gross).toBe(120);
      expect(result.discounts).toBe(15);
      expect(result.net).toBe(105);
    });
  });

  describe('calculateSaleTotals', () => {
    it('should compute totals with item discount, service discount, sale discount and change', () => {
      const items = [
        makeItem({
          salePriceSnapshot: 50,
          quantitySold: 2,
          discountInfo: { value: 10 },
        }),
      ];
      const services = [
        makeService({ amount: 20, discount: { value: 2 } }),
      ];
      const payments = [{ type: 'CASH' as any, amount: 120 }];

      const result = calculateSaleTotals(
        { discount: { value: 20 } },
        items,
        services,
        payments,
      );

      expect(result.items.gross).toBe(100);
      expect(result.items.discounts).toBe(10);
      expect(result.services.gross).toBe(20);
      expect(result.services.discounts).toBe(2);
      expect(result.subtotal).toBe(108);
      expect(result.saleDiscount).toBe(20);
      expect(result.total).toBe(88);
      expect(result.paid).toBe(120);
      expect(result.change).toBe(32);
      expect(result.summary.total).toBe(88);
      expect(result.summary.change).toBe(32);
    });

    it('should handle sale with no discounts', () => {
      const items = [makeItem({ salePriceSnapshot: 10, quantitySold: 3 })];
      const services: SaleServiceEntity[] = [];
      const payments = [{ type: 'CASH' as any, amount: 30 }];

      const result = calculateSaleTotals(
        { discount: null },
        items,
        services,
        payments,
      );

      expect(result.total).toBe(30);
      expect(result.change).toBe(0);
    });
  });
});
