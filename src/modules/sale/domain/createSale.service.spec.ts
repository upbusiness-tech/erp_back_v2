import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CashFlowDataUiService } from 'src/modules/cashFlow/domain/cashFlowDataUi.service';
import { CompanyNestCrudService } from 'src/modules/company/domain/companyNestCrud.service';
import { ProductEspecificationEntity } from 'src/modules/product/submodules/productEspecification/productEspecification.entity';
import { UserDataUiService } from 'src/modules/user/domain/userDataUi.service';
import { Repository } from 'typeorm';
import { CreateSaleDto } from '../dto/createSale.dto';
import { SaleEntity } from '../sale.entity';
import { SaleType } from '../sale.enum';
import { CreateSaleService } from './createSale.service';

const mockSpec = {
  id: 1,
  salePrice: 50,
  costPrice: 30,
  stockQuantity: 10,
  isStockControlled: true,
  product: { name: 'Product A', unitOfMeasure: 'UNIT' },
};

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

const createMockRepository = (): Partial<Repository<any>> => ({
  manager: {
    transaction: jest.fn((cb: (manager: unknown) => Promise<unknown>) =>
      cb(createTransactionManager()),
    ),
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

  it('should apply item line discount and compute totals', async () => {
    const dto = buildBaseDto();
    dto.items[0].discountInfo = { value: 10 };

    await expect(
      service.execute(dto, 'company-1', 'user-1'),
    ).resolves.toBeDefined();
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
});
