import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CashFlowDataUiService } from 'src/modules/cashFlow/domain/cashFlowDataUi.service';
import { CompanyNestCrudService } from 'src/modules/company/domain/companyNestCrud.service';
import { InternCustomerEntity } from 'src/modules/internCustomer/internCustomer.entity';
import { InternCustomerType } from 'src/modules/internCustomer/internCustomer.enum';
import { InternCustomerPriceEntity } from 'src/modules/internCustomer/submodules/internCustomerPrice/internCustomerPrice.entity';
import { ProductEspecificationEntity } from 'src/modules/product/submodules/productEspecification/productEspecification.entity';
import { UserDataUiService } from 'src/modules/user/domain/userDataUi.service';
import { Repository } from 'typeorm';
import { CreateSaleDto } from '../dto/createSale.dto';
import { SaleEntity } from '../sale.entity';
import { SaleType, SpecialPriceSource } from '../sale.enum';
import { SaleItemEntity } from '../submodules/saleItem/saleItem.entity';
import { CreateSaleService } from './createSale.service';

const mockSpec = {
  id: 1,
  salePrice: 50,
  costPrice: 30,
  stockQuantity: 10,
  isStockControlled: true,
  product: { name: 'Product A', unitOfMeasure: 'Unidade' },
};

let mockInternPrices: Array<{ id: number; specialPrice: number }> = [];

const createTransactionManager = () => ({
  query: jest.fn().mockResolvedValue([{ lastNumber: 1 }]),
  save: jest.fn().mockImplementation((entityType, data: unknown) => {
    if (Array.isArray(data)) {
      return Promise.resolve(
        data.map((d, index) => ({ id: index + 1, ...(d as object) })),
      );
    }
    return Promise.resolve({ id: 1, ...(data as object) });
  }),
  find: jest.fn().mockImplementation((entityType) => {
    if (entityType === ProductEspecificationEntity) {
      return Promise.resolve([mockSpec]);
    }
    if (entityType === InternCustomerPriceEntity) {
      return Promise.resolve(mockInternPrices);
    }
    return Promise.resolve([]);
  }),
  findOne: jest.fn().mockResolvedValue({ id: 1 }),
  createQueryBuilder: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue({ affected: 1 }),
  }),
});

let lastTransactionManager: ReturnType<typeof createTransactionManager>;

const createMockRepository = (): Partial<Repository<any>> => ({
  manager: {
    transaction: jest.fn((cb: (manager: unknown) => Promise<unknown>) => {
      lastTransactionManager = createTransactionManager();
      return cb(lastTransactionManager);
    }),
  } as any,
});

const createCompanyService = () => ({
  findActiveCompany: jest.fn().mockResolvedValue({ uid: 'company-1' }),
});

const createUserService = () => ({
  validateEmployeeUser: jest.fn().mockResolvedValue(undefined),
});

const createCashFlowService = () => ({
  validateOpenCashFlow: jest.fn().mockResolvedValue(undefined),
});

describe('CreateSaleService', () => {
  let service: CreateSaleService;

  beforeEach(async () => {
    mockSpec.salePrice = 50;
    mockSpec.costPrice = 30;
    mockSpec.stockQuantity = 10;
    mockSpec.isStockControlled = true;
    mockInternPrices = [];

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateSaleService,
        {
          provide: getRepositoryToken(SaleEntity),
          useValue: createMockRepository(),
        },
        { provide: CompanyNestCrudService, useValue: createCompanyService() },
        { provide: UserDataUiService, useValue: createUserService() },
        { provide: CashFlowDataUiService, useValue: createCashFlowService() },
      ],
    }).compile();

    service = module.get<CreateSaleService>(CreateSaleService);
  });

  const buildBaseDto = (): CreateSaleDto => ({
    type: SaleType.NORMAL,
    internCustomerId: undefined,
    cashFlowId: 1,
    items: [
      {
        note: undefined,
        quantitySold: 2,
        unitSold: 1,
        unitOfMeasure: 'Unidade' as any,
        isEspecialPrice: false,
        internCustomerPriceId: undefined,
        productId: 1,
        productEspecificationId: 1,
        discountInfo: undefined,
      },
    ],
    payments: [{ type: 'CASH' as any, amount: 100 }],
    services: [],
    discount: undefined,
  });

  it('should apply item line discount to persisted item amounts', async () => {
    const dto = buildBaseDto();
    dto.items[0].discountInfo = { value: 10 };

    await expect(
      service.execute(dto, 'company-1', 'user-1'),
    ).resolves.toBeDefined();

    const savedItem = lastTransactionManager.save.mock.calls.find(
      ([entityType]) => entityType === SaleItemEntity,
    )[1][0];
    const savedSale = lastTransactionManager.save.mock.calls.find(
      ([entityType]) => entityType === SaleEntity,
    )[1];

    expect(savedItem).toMatchObject({
      amountItem: 90,
      amountProfitItem: 30,
      saleDiscountShare: 0,
    });
    expect(savedSale.amountProfit).toBe(30);
  });

  it('should allocate the global sale discount separately from item profit', async () => {
    const dto = buildBaseDto();
    dto.items[0].discountInfo = { value: 10 };
    dto.discount = { value: 20 };

    await expect(
      service.execute(dto, 'company-1', 'user-1'),
    ).resolves.toBeDefined();

    const savedItem = lastTransactionManager.save.mock.calls.find(
      ([entityType]) => entityType === SaleItemEntity,
    )[1][0];
    const savedSale = lastTransactionManager.save.mock.calls.find(
      ([entityType]) => entityType === SaleEntity,
    )[1];

    expect(savedItem).toMatchObject({
      amountProfitItem: 30,
      saleDiscountShare: 20,
    });
    expect(savedSale.amountProfit).toBe(10);
  });

  it('should reject item discount greater than line gross', async () => {
    const dto = buildBaseDto();
    dto.items[0].discountInfo = { value: 999 };

    await expect(service.execute(dto, 'company-1', 'user-1')).rejects.toThrow(
      new HttpException(
        'Desconto do item não pode exceder o valor da linha',
        400,
      ),
    );
  });

  it('should reject insufficient payment', async () => {
    const dto = buildBaseDto();
    dto.payments[0].amount = 50;

    await expect(service.execute(dto, 'company-1', 'user-1')).rejects.toThrow(
      new HttpException('Valor pago é insuficiente para o total da venda', 400),
    );
  });

  it('should persist the negotiated price snapshot and profit', async () => {
    mockSpec.costPrice = 20;
    const dto = buildBaseDto();
    dto.items[0].specialPrice = 28;

    await expect(
      service.execute(dto, 'company-1', 'user-1'),
    ).resolves.toBeDefined();

    const savedItem = lastTransactionManager.save.mock.calls.find(
      ([entityType]) => entityType === SaleItemEntity,
    )[1][0];
    const savedSale = lastTransactionManager.save.mock.calls.find(
      ([entityType]) => entityType === SaleEntity,
    )[1];

    expect(savedItem).toMatchObject({
      specialPriceSnapshot: 28,
      isEspecialPrice: true,
      amountItem: 56,
      amountProfitItem: 16,
    });
    expect(savedSale.amountProfit).toBe(16);
  });

  it('should accept a negotiated price above the catalog price', async () => {
    const dto = buildBaseDto();
    dto.items[0].specialPrice = 60;
    dto.payments[0].amount = 200;

    await expect(
      service.execute(dto, 'company-1', 'user-1'),
    ).resolves.toBeDefined();

    const savedItem = lastTransactionManager.save.mock.calls.find(
      ([entityType]) => entityType === SaleItemEntity,
    )[1][0];

    expect(savedItem).toMatchObject({
      salePriceSnapshot: 50,
      specialPriceSnapshot: 60,
      amountItem: 120,
      amountProfitItem: 60,
    });
  });

  it('should reject an item with specialPrice and internCustomerPriceId', async () => {
    const dto = buildBaseDto();
    dto.items[0].specialPrice = 28;
    dto.items[0].internCustomerPriceId = 7;

    await expect(service.execute(dto, 'company-1', 'user-1')).rejects.toThrow(
      new HttpException(
        'Informe preço negociado ou preço especial de cliente, não ambos',
        400,
      ),
    );
  });

  it('should reject specialPrice when the sale has an internCustomerId', async () => {
    const dto = buildBaseDto();
    dto.internCustomerId = 1;
    dto.items[0].specialPrice = 28;

    await expect(service.execute(dto, 'company-1', 'user-1')).rejects.toThrow(
      new HttpException(
        'Preço negociado só é permitido em vendas sem cliente cadastrado',
        400,
      ),
    );
  });

  it('should reject specialPrice equal to zero or negative', async () => {
    for (const specialPrice of [0, -5]) {
      const dto = buildBaseDto();
      dto.items[0].specialPrice = specialPrice;

      await expect(service.execute(dto, 'company-1', 'user-1')).rejects.toThrow(
        new HttpException('Preço negociado deve ser maior que zero', 400),
      );
    }
  });

  it('should apply the negotiated price even when isEspecialPrice is false', async () => {
    const dto = buildBaseDto();
    dto.items[0].isEspecialPrice = false;
    dto.items[0].specialPrice = 28;

    await expect(
      service.execute(dto, 'company-1', 'user-1'),
    ).resolves.toBeDefined();

    const savedItem = lastTransactionManager.save.mock.calls.find(
      ([entityType]) => entityType === SaleItemEntity,
    )[1][0];

    expect(savedItem).toMatchObject({
      isEspecialPrice: true,
      specialPriceSnapshot: 28,
      amountItem: 56,
    });
  });

  it('should use the catalog price when isEspecialPrice is true without a special price', async () => {
    const dto = buildBaseDto();
    dto.items[0].isEspecialPrice = true;

    await expect(
      service.execute(dto, 'company-1', 'user-1'),
    ).resolves.toBeDefined();

    const savedItem = lastTransactionManager.save.mock.calls.find(
      ([entityType]) => entityType === SaleItemEntity,
    )[1][0];

    expect(savedItem).toMatchObject({
      isEspecialPrice: false,
      specialPriceSnapshot: null,
      salePriceSnapshot: 50,
      amountItem: 100,
      amountProfitItem: 40,
    });
  });

  it('should persist the isolatedCustomer snapshot without saving an intern customer', async () => {
    const isolatedCustomer = {
      name: 'Cliente Avulso',
      type: InternCustomerType.INDIVIDUAL,
      address: 'Rua 1',
      phoneNumber: '11999999999',
    };
    const dto = buildBaseDto();
    dto.isolatedCustomer = isolatedCustomer;

    await expect(
      service.execute(dto, 'company-1', 'user-1'),
    ).resolves.toBeDefined();

    const savedSale = lastTransactionManager.save.mock.calls.find(
      ([entityType]) => entityType === SaleEntity,
    )[1];

    expect(savedSale.isolatedCustomer).toEqual(isolatedCustomer);
    expect(
      lastTransactionManager.save.mock.calls.some(
        ([entityType]) => entityType === InternCustomerEntity,
      ),
    ).toBe(false);
  });

  it('should reject isolatedCustomer together with internCustomerId', async () => {
    const dto = buildBaseDto();
    dto.isolatedCustomer = { name: 'Cliente Avulso' };
    dto.internCustomerId = 1;

    await expect(service.execute(dto, 'company-1', 'user-1')).rejects.toThrow(
      new HttpException(
        'Não é permitido informar cliente cadastrado e cliente avulso na mesma venda',
        400,
      ),
    );
  });

  it('should keep snapshots unchanged when the catalog price changes after the sale', async () => {
    const dto = buildBaseDto();
    dto.items[0].specialPrice = 28;

    await expect(
      service.execute(dto, 'company-1', 'user-1'),
    ).resolves.toBeDefined();

    const savedItem = lastTransactionManager.save.mock.calls.find(
      ([entityType]) => entityType === SaleItemEntity,
    )[1][0];

    mockSpec.salePrice = 999;
    mockSpec.costPrice = 999;

    expect(savedItem).toMatchObject({
      salePriceSnapshot: 50,
      specialPriceSnapshot: 28,
      costPriceSnapshot: 30,
      amountItem: 56,
      amountProfitItem: -4,
    });
    expect(savedItem.productSnapshot.salePrice).toBe(50);
    expect(savedItem.productSnapshot.costPrice).toBe(30);
  });

  it('should resolve the price from a valid internCustomerPriceId', async () => {
    mockInternPrices = [{ id: 7, specialPrice: 40 }];
    const dto = buildBaseDto();
    dto.items[0].internCustomerPriceId = 7;

    await expect(
      service.execute(dto, 'company-1', 'user-1'),
    ).resolves.toBeDefined();

    const savedItem = lastTransactionManager.save.mock.calls.find(
      ([entityType]) => entityType === SaleItemEntity,
    )[1][0];

    expect(savedItem).toMatchObject({
      internCustomerPriceId: 7,
      specialPriceSnapshot: 40,
      isEspecialPrice: true,
      amountItem: 80,
      amountProfitItem: 20,
    });
  });

  it('should mark the catalog as the special price source when no special price is informed', async () => {
    const dto = buildBaseDto();

    await expect(
      service.execute(dto, 'company-1', 'user-1'),
    ).resolves.toBeDefined();

    const savedItem = lastTransactionManager.save.mock.calls.find(
      ([entityType]) => entityType === SaleItemEntity,
    )[1][0];

    expect(savedItem.specialPriceSource).toBe(SpecialPriceSource.CATALOG);
  });

  it('should mark the customer table as the special price source when internCustomerPriceId is used', async () => {
    mockInternPrices = [{ id: 7, specialPrice: 40 }];
    const dto = buildBaseDto();
    dto.internCustomerId = 1;
    dto.items[0].internCustomerPriceId = 7;

    await expect(
      service.execute(dto, 'company-1', 'user-1'),
    ).resolves.toBeDefined();

    const savedItem = lastTransactionManager.save.mock.calls.find(
      ([entityType]) => entityType === SaleItemEntity,
    )[1][0];

    expect(savedItem.specialPriceSource).toBe(
      SpecialPriceSource.CUSTOMER_TABLE,
    );
  });

  it('should mark the negotiated price as the special price source when specialPrice is used', async () => {
    const dto = buildBaseDto();
    dto.items[0].specialPrice = 28;

    await expect(
      service.execute(dto, 'company-1', 'user-1'),
    ).resolves.toBeDefined();

    const savedItem = lastTransactionManager.save.mock.calls.find(
      ([entityType]) => entityType === SaleItemEntity,
    )[1][0];

    expect(savedItem.specialPriceSource).toBe(SpecialPriceSource.NEGOTIATED);
  });
});
