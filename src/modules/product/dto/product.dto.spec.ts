import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ProductUnitOfMeasure } from '../product.enum';
import { CreateProductDto } from './createProduct.dto';
import { UpdateProductDto } from './updateProduct.dto';

describe('Product DTOs', () => {
  it('allows creating a product with an empty variants list', async () => {
    const dto = plainToInstance(CreateProductDto, {
      name: 'Produto',
      unitOfMeasure: ProductUnitOfMeasure.UNIT,
      variants: [],
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('requires the variants field on creation', async () => {
    const dto = plainToInstance(CreateProductDto, {
      name: 'Produto',
      unitOfMeasure: ProductUnitOfMeasure.UNIT,
    });

    const errors = await validate(dto);
    expect(errors.some((error) => error.property === 'variants')).toBe(true);
  });

  it('allows a diff update with an empty idsToDelete and no variants', async () => {
    const dto = plainToInstance(UpdateProductDto, {
      idsToDelete: [],
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('allows a diff update with only idsToDelete', async () => {
    const dto = plainToInstance(UpdateProductDto, {
      idsToDelete: [1, 2],
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects non-integer idsToDelete values', async () => {
    const dto = plainToInstance(UpdateProductDto, {
      idsToDelete: ['x'],
    });

    const errors = await validate(dto);
    expect(errors.some((error) => error.property === 'idsToDelete')).toBe(true);
  });

  it('allows a legacy update without idsToDelete', async () => {
    const dto = plainToInstance(UpdateProductDto, {
      variants: [],
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });
});
