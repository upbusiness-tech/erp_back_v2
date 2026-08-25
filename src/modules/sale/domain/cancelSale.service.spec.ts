import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CashFlowTransactionEntity } from 'src/modules/cashFlow/submodules/cashFlowTransaction/cashFlowTransaction.entity';
import { ProductEspecificationEntity } from 'src/modules/product/submodules/productEspecification/productEspecification.entity';
import { ProductTransactionRecordsEntity } from 'src/modules/product/submodules/productTransaction/productTransactionRecords.entity';
import type { EmployeeTokenPayload } from 'src/auth/auth.types';
import { Repository } from 'typeorm';
import { SaleEntity } from '../sale.entity';
import { SaleStatus } from '../sale.enum';
import { CancelSaleService } from './cancelSale.service';

const employee: EmployeeTokenPayload = {
  uid: 'employee-1',
  companyUid: 'company-1',
} as EmployeeTokenPayload;

const buildSale = (overrides: Partial<SaleEntity> = {}): SaleEntity =>
  ({
    id: 10,
    companyUid: 'company-1',
    status: SaleStatus.COMPLETED,
    items: [
      {
        id: 100,
        quantitySold: 3,
        unitSold: 1,
        productEspecificationId: 7,
        productEspecification: { id: 7, isStockControlled: true },
      },
      {
        id: 101,
        quantitySold: 5,
        unitSold: 1,
        productEspecificationId: 8,
        productEspecification: { id: 8, isStockControlled: false },
      },
    ],
    ...overrides,
  }) as SaleEntity;

const createTransactionManager = () => {
  const queryBuilder = {
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue({ affected: 1 }),
  };

  return {
    queryBuilder,
    update: jest.fn().mockResolvedValue(undefined),
    softDelete: jest.fn().mockResolvedValue(undefined),
    findOne: jest.fn().mockResolvedValue({ id: 10, status: SaleStatus.CANCELED }),
    createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
  };
};

describe('CancelSaleService', () => {
  let service: CancelSaleService;
  let repo: Partial<Repository<SaleEntity>>;
  let transactionManager: ReturnType<typeof createTransactionManager>;
  let findOneMock: jest.Mock;

  const compile = async (foundSale: SaleEntity | null) => {
    findOneMock = jest.fn().mockResolvedValue(foundSale);

    repo = {
      findOne: findOneMock,
      manager: {
        transaction: jest.fn((cb: (manager: unknown) => Promise<unknown>) =>
          cb(transactionManager),
        ),
      } as any,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CancelSaleService,
        { provide: getRepositoryToken(SaleEntity), useValue: repo },
      ],
    }).compile();

    return module.get<CancelSaleService>(CancelSaleService);
  };

  beforeEach(() => {
    transactionManager = createTransactionManager();
  });

  it('rejects with not found when the sale does not exist in the company', async () => {
    service = await compile(null);

    await expect(service.execute(999, employee)).rejects.toThrow(
      new HttpException('Venda para cancelar não encontrado', 400),
    );
    expect(repo.manager.transaction).not.toHaveBeenCalled();
  });

  it('rejects an already canceled sale without running any reversal', async () => {
    service = await compile(buildSale({ status: SaleStatus.CANCELED }));

    await expect(service.execute(10, employee)).rejects.toThrow(
      new HttpException('Venda já está cancelada', 400),
    );
    expect(repo.manager.transaction).not.toHaveBeenCalled();
  });

  it('cancels the sale, reverses cash flow and stock records, and restocks controlled specs only', async () => {
    const sale = buildSale();
    service = await compile(sale);

    const result = await service.execute(10, employee);

    expect(transactionManager.update).toHaveBeenCalledWith(SaleEntity, 10, {
      status: SaleStatus.CANCELED,
      canceledAt: expect.any(Date),
      canceledByUserUid: employee.uid,
    });

    expect(transactionManager.softDelete).toHaveBeenCalledWith(
      CashFlowTransactionEntity,
      { saleId: 10 },
    );
    expect(transactionManager.softDelete).toHaveBeenCalledWith(
      ProductTransactionRecordsEntity,
      { saleId: 10 },
    );

    // apenas a especificação com controle de estoque é re-estocada
    expect(transactionManager.createQueryBuilder).toHaveBeenCalledTimes(1);

    // o incremento é passado como função SQL ao query builder
    const setArg = transactionManager.queryBuilder.set.mock.calls[0][0] as {
      stockQuantity: () => string;
    };
    expect(setArg.stockQuantity()).toBe('stockQuantity + (3 * 1)');

    expect(transactionManager.queryBuilder.where).toHaveBeenCalledWith(
      'id = :id',
      { id: 7 },
    );

    expect(result).toEqual({
      id: 10,
      status: SaleStatus.CANCELED,
    });
  });

  it('propagates failures so the whole cancellation rolls back', async () => {
    service = await compile(buildSale());

    transactionManager.softDelete.mockRejectedValueOnce(
      new Error('cash flow failure'),
    );

    await expect(service.execute(10, employee)).rejects.toThrow(
      new HttpException('cash flow failure', 400),
    );
    // nenhuma etapa posterior é executada
    expect(transactionManager.createQueryBuilder).not.toHaveBeenCalled();
  });
});
