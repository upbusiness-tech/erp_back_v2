import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStockLimitsToProductEspecifications1791600000000 implements MigrationInterface {
  name = 'AddStockLimitsToProductEspecifications1791600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "product_especifications" ADD COLUMN IF NOT EXISTS "maxStock" numeric',
    );
    await queryRunner.query(
      'ALTER TABLE "product_especifications" ADD COLUMN IF NOT EXISTS "minStock" numeric',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "product_especifications" DROP COLUMN IF EXISTS "minStock"',
    );
    await queryRunner.query(
      'ALTER TABLE "product_especifications" DROP COLUMN IF EXISTS "maxStock"',
    );
  }
}
