import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsolatedCustomerToSales1791200000000 implements MigrationInterface {
  name = 'AddIsolatedCustomerToSales1791200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "isolatedCustomer" jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sales" DROP COLUMN IF EXISTS "isolatedCustomer"`,
    );
  }
}
