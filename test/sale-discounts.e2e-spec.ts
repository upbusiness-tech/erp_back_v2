import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Sale discounts (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  // These tests require a running database and authenticated session.
  // They cover the discount scenarios defined in the sale-discounts spec.

  it.todo('should create a sale with item line discount');
  it.todo('should create a sale with service discount');
  it.todo('should create a sale with global discount and calculate change');
  it.todo('should reject item discount exceeding line gross');
  it.todo('should reject insufficient payment');
  it.todo('should record cash flow transaction with final total');
});
