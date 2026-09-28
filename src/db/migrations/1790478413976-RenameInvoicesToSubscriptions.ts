import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameInvoicesToSubscriptions1790478413976
  implements MigrationInterface
{
  name = 'RenameInvoicesToSubscriptions1790478413976';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Rename table invoices -> subscriptions (preserves data)
    await queryRunner.query(
      `ALTER TABLE "invoices" RENAME TO "subscriptions"`,
    );

    // 2. Rename invoice permission keys and module
    await queryRunner.query(
      `UPDATE "permissions"
       SET "key" = 'subscription_create',
           "module" = 'Subscription',
           "title" = 'Criar mensalidade',
           "description" = 'Permite criar novas mensalidades'
       WHERE "key" = 'invoice_create'`,
    );
    await queryRunner.query(
      `UPDATE "permissions"
       SET "key" = 'subscription_read',
           "module" = 'Subscription',
           "title" = 'Visualizar mensalidades',
           "description" = 'Permite visualizar mensalidades existentes'
       WHERE "key" = 'invoice_read'`,
    );
    await queryRunner.query(
      `UPDATE "permissions"
       SET "key" = 'subscription_update',
           "module" = 'Subscription',
           "title" = 'Editar mensalidades',
           "description" = 'Permite editar mensalidades existentes'
       WHERE "key" = 'invoice_update'`,
    );
    await queryRunner.query(
      `UPDATE "permissions"
       SET "key" = 'subscription_send_proof',
           "module" = 'Subscription',
           "title" = 'Enviar comprovante',
           "description" = 'Permite enviar comprovante de pagamento da mensalidade'
       WHERE "key" = 'invoice_send_proof'`,
    );

    // 3. Rename sidebar permission key
    await queryRunner.query(
      `UPDATE "permissions"
       SET "key" = 'access_subscriptions_section'
       WHERE "key" = 'access_invoices_section'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Rename table back
    await queryRunner.query(
      `ALTER TABLE "subscriptions" RENAME TO "invoices"`,
    );

    // 2. Revert permission keys and module
    await queryRunner.query(
      `UPDATE "permissions"
       SET "key" = 'invoice_create',
           "module" = 'Invoice',
           "title" = 'Criar fatura',
           "description" = 'Permite criar novas faturas'
       WHERE "key" = 'subscription_create'`,
    );
    await queryRunner.query(
      `UPDATE "permissions"
       SET "key" = 'invoice_read',
           "module" = 'Invoice',
           "title" = 'Visualizar faturas',
           "description" = 'Permite visualizar faturas existentes'
       WHERE "key" = 'subscription_read'`,
    );
    await queryRunner.query(
      `UPDATE "permissions"
       SET "key" = 'invoice_update',
           "module" = 'Invoice',
           "title" = 'Editar faturas',
           "description" = 'Permite editar faturas existentes'
       WHERE "key" = 'subscription_update'`,
    );
    await queryRunner.query(
      `UPDATE "permissions"
       SET "key" = 'invoice_send_proof',
           "module" = 'Invoice',
           "title" = 'Enviar comprovante',
           "description" = 'Permite enviar comprovante de pagamento da fatura'
       WHERE "key" = 'subscription_send_proof'`,
    );

    // 3. Revert sidebar permission key
    await queryRunner.query(
      `UPDATE "permissions"
       SET "key" = 'access_invoices_section'
       WHERE "key" = 'access_subscriptions_section'`,
    );
  }
}