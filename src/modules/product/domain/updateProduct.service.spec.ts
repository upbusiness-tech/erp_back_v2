import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CompanyNestCrudService } from 'src/modules/company/domain/companyNestCrud.service';
import { UserDataUiService } from 'src/modules/user/domain/userDataUi.service';
import { ProductEntity } from '../product.entity';
import { ProductEspecificationEntity } from '../submodules/productEspecification/productEspecification.entity';
import { ProductTransactionRecordsEntity } from '../submodules/productTransaction/productTransactionRecords.entity';
import { ProductTransactionType } from '../submodules/productTransaction/productTransactionRecords.enum';
import { UpdateProductService } from './updateProduct.service';

const buildVariant = (
  id: number,
  overrides: Partial<ProductEspecificationEntity> = {},
): ProductEspecificationEntity =>
  ({
    id,
    productId: 1,
    code: `C${id}`,
    barcode: null,
    salePrice: 10,
    costPrice: 5,
    isStockControlled: true,
    stockQuantity: 5,
    size: null,
    color: null,
    brand: null,
    productSupplierId: null,
    deletedAt: null,
    ...overrides,
  }) as ProductEspecificationEntity;

const productFound = {
  id: 1,
  companyUid: 'company-1',
  productFiscalClassificationId: null,
} as ProductEntity;

const canonicalProduct = {
  id: 1,
  name: 'Updated',
  productEspecifications: [buildVariant(1)],
} as ProductEntity;

let transactionManager: {
  update: jest.Mock;
  save: jest.Mock;
  softRemove: jest.Mock;
};

let repo: {
  findOne: jest.Mock;
  manager: { transaction: jest.Mock };
};

let productEspecificationRepo: {
  find: jest.Mock;
};

let companyService: {
  findActiveCompany: jest.Mock;
};

let userService: {
  validateEmployeeUser: jest.Mock;
};

describe('UpdateProductService', () => {
  let service: UpdateProductService;

  beforeEach(async () => {
    transactionManager = {
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      save: jest
        .fn()
        .mockImplementation((_entity, data: unknown) =>
          Promise.resolve({ id: 99, ...(data as object) }),
        ),
      softRemove: jest.fn().mockResolvedValue(undefined),
    };

    repo = {
      findOne: jest
        .fn()
        .mockResolvedValueOnce(productFound)
        .mockResolvedValueOnce(canonicalProduct),
      manager: {
        transaction: jest.fn(
          (callback: (manager: unknown) => Promise<unknown>) =>
            callback(transactionManager),
        ),
      },
    };

    productEspecificationRepo = {
      find: jest.fn().mockResolvedValue([buildVariant(1), buildVariant(2)]),
    };

    companyService = {
      findActiveCompany: jest
        .fn()
        .mockResolvedValue({ uid: 'company-1', planId: -1 }),
    };

    userService = {
      validateEmployeeUser: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateProductService,
        {
          provide: getRepositoryToken(ProductEntity),
          useValue: repo,
        },
        {
          provide: getRepositoryToken(ProductEspecificationEntity),
          useValue: productEspecificationRepo,
        },
        { provide: CompanyNestCrudService, useValue: companyService },
        { provide: UserDataUiService, useValue: userService },
      ],
    }).compile();

    service = module.get<UpdateProductService>(UpdateProductService);
  });

  it('updates only sent variants and soft-deletes only idsToDelete in diff mode', async () => {
    await service.execute(
      1,
      {
        name: 'Updated',
        idsToDelete: [2],
        variants: [
          {
            id: 1,
            code: 'C1',
            salePrice: 20,
            costPrice: 5,
            isStockControlled: true,
            stockQuantity: 8,
          },
        ],
      },
      'company-1',
      'employee-1',
    );

    expect(productEspecificationRepo.find).toHaveBeenCalledWith({
      where: { productId: 1 },
      withDeleted: false,
    });

    expect(transactionManager.softRemove).toHaveBeenCalledWith(
      ProductEspecificationEntity,
      [expect.objectContaining({ id: 2 })],
    );

    expect(transactionManager.update).toHaveBeenCalledWith(
      ProductEspecificationEntity,
      { id: 1, productId: 1 },
      expect.objectContaining({ salePrice: 20, stockQuantity: 8 }),
    );

    expect(transactionManager.save).toHaveBeenCalledWith(
      ProductTransactionRecordsEntity,
      expect.objectContaining({
        type: ProductTransactionType.PLUS,
        value: 3,
        productEspecificationId: 1,
      }),
    );
  });

  it('creates new variants without id and registers initial stock', async () => {
    await service.execute(
      1,
      {
        idsToDelete: [],
        variants: [
          {
            code: 'NEW',
            salePrice: 10,
            costPrice: 5,
            isStockControlled: true,
            stockQuantity: 4,
          },
        ],
      },
      'company-1',
      'employee-1',
    );

    expect(transactionManager.save).toHaveBeenCalledWith(
      ProductEspecificationEntity,
      expect.objectContaining({ code: 'NEW', productId: 1 }),
    );

    expect(transactionManager.save).toHaveBeenCalledWith(
      ProductTransactionRecordsEntity,
      expect.objectContaining({
        type: ProductTransactionType.PLUS,
        value: 4,
        productEspecificationId: 99,
      }),
    );
  });

  it('ignores unknown or already deleted idsToDelete', async () => {
    await service.execute(
      1,
      { idsToDelete: [999], variants: [] },
      'company-1',
      'employee-1',
    );

    expect(transactionManager.softRemove).not.toHaveBeenCalled();
  });

  it('rejects an update id that does not belong to the product', async () => {
    await expect(
      service.execute(
        1,
        {
          idsToDelete: [],
          variants: [
            {
              id: 999,
              code: 'X',
              salePrice: 10,
              costPrice: 5,
              isStockControlled: true,
              stockQuantity: 1,
            },
          ],
        },
        'company-1',
        'employee-1',
      ),
    ).rejects.toBeInstanceOf(HttpException);

    expect(transactionManager.softRemove).not.toHaveBeenCalled();
  });

  it('rejects duplicate update ids', async () => {
    const variant = {
      id: 1,
      code: 'C1',
      salePrice: 10,
      costPrice: 5,
      isStockControlled: true,
      stockQuantity: 1,
    };

    await expect(
      service.execute(
        1,
        { idsToDelete: [], variants: [variant, variant] },
        'company-1',
        'employee-1',
      ),
    ).rejects.toBeInstanceOf(HttpException);
  });

  it('rejects overlap between update ids and idsToDelete', async () => {
    await expect(
      service.execute(
        1,
        {
          idsToDelete: [1],
          variants: [
            {
              id: 1,
              code: 'C1',
              salePrice: 10,
              costPrice: 5,
              isStockControlled: true,
              stockQuantity: 1,
            },
          ],
        },
        'company-1',
        'employee-1',
      ),
    ).rejects.toBeInstanceOf(HttpException);
  });

  it('allows removing every active variant in diff mode', async () => {
    await service.execute(
      1,
      { idsToDelete: [1, 2], variants: [] },
      'company-1',
      'employee-1',
    );

    expect(transactionManager.softRemove).toHaveBeenCalledWith(
      ProductEspecificationEntity,
      [expect.objectContaining({ id: 1 }), expect.objectContaining({ id: 2 })],
    );
  });

  it('does not create SUBTRACTION when stock decreases', async () => {
    await service.execute(
      1,
      {
        idsToDelete: [],
        variants: [
          {
            id: 1,
            code: 'C1',
            salePrice: 10,
            costPrice: 5,
            isStockControlled: true,
            stockQuantity: 2,
          },
        ],
      },
      'company-1',
      'employee-1',
    );

    expect(transactionManager.save).not.toHaveBeenCalledWith(
      ProductTransactionRecordsEntity,
      expect.objectContaining({ type: ProductTransactionType.SUBTRACTION }),
    );
  });

  it('keeps the legacy full-replace behavior when idsToDelete is absent', async () => {
    await service.execute(
      1,
      {
        variants: [
          {
            id: 1,
            code: 'C1',
            salePrice: 10,
            costPrice: 5,
            isStockControlled: true,
            stockQuantity: 5,
          },
        ],
      },
      'company-1',
      'employee-1',
    );

    expect(productEspecificationRepo.find).toHaveBeenCalledWith({
      where: { productId: 1 },
      withDeleted: true,
    });

    expect(transactionManager.softRemove).toHaveBeenCalledWith(
      ProductEspecificationEntity,
      [expect.objectContaining({ id: 2 })],
    );
  });

  it('rejects legacy mode without variants', async () => {
    await expect(
      service.execute(1, {}, 'company-1', 'employee-1'),
    ).rejects.toBeInstanceOf(HttpException);
  });

  it('processes a diff update with 200 variants', async () => {
    const manyVariants = Array.from({ length: 200 }, (_, index) =>
      buildVariant(index + 1),
    );
    productEspecificationRepo.find.mockResolvedValue(manyVariants);

    await service.execute(
      1,
      {
        idsToDelete: [],
        variants: manyVariants.map((variant) => ({
          id: variant.id,
          code: variant.code,
          salePrice: 20,
          costPrice: 5,
          isStockControlled: true,
          stockQuantity: variant.stockQuantity,
        })),
      },
      'company-1',
      'employee-1',
    );

    const variantUpdateCalls = transactionManager.update.mock.calls.filter(
      ([entity]) => entity === ProductEspecificationEntity,
    );
    expect(variantUpdateCalls).toHaveLength(200);
  });

  it('returns the canonical product without deleted variants', async () => {
    repo.findOne
      .mockReset()
      .mockResolvedValueOnce(productFound)
      .mockResolvedValueOnce({
        id: 1,
        productEspecifications: [
          buildVariant(1),
          buildVariant(2, { deletedAt: new Date() }),
        ],
      });

    const result = await service.execute(
      1,
      { idsToDelete: [], variants: [] },
      'company-1',
      'employee-1',
    );

    expect(result?.productEspecifications).toHaveLength(1);
    expect(result?.productEspecifications?.[0].id).toBe(1);
  });
});
