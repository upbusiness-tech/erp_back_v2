import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddContextToInternCustomers1791400000000
  implements MigrationInterface
{
  name = 'AddContextToInternCustomers1791400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "intern_customers" ADD COLUMN IF NOT EXISTS "context" varchar NOT NULL DEFAULT 'Cadastrado'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "intern_customers" DROP COLUMN IF EXISTS "context"`,
    );
  }
}
