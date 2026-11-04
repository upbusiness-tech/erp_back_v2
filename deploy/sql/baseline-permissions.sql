-- Consolida permissoes legadas invoice_* em subscription_*.
-- A migration RenameInvoicesToSubscriptions nao rodou nesses bancos, entao as
-- chaves antigas permaneceram. Idempotente e preserva vinculos em user_permissions.

BEGIN;

-- 1. Repointa vinculos das chaves antigas para as novas quando ambas existem.
INSERT INTO "user_permissions" ("user_uid", "permission_id")
SELECT up."user_uid", sub."id"
FROM "user_permissions" up
JOIN "permissions" old_perm
  ON old_perm."id" = up."permission_id"
 AND old_perm."key" LIKE 'invoice_%'
JOIN "permissions" sub
  ON sub."key" = 'subscription_' || substring(old_perm."key" from 9)
ON CONFLICT DO NOTHING;

-- 2. Remove os vinculos antigos que ja foram repointados.
DELETE FROM "user_permissions" up
USING "permissions" old_perm, "permissions" sub
WHERE up."permission_id" = old_perm."id"
  AND old_perm."key" LIKE 'invoice_%'
  AND sub."key" = 'subscription_' || substring(old_perm."key" from 9);

-- 3. Remove as permissoes antigas que possuem equivalente novo.
DELETE FROM "permissions" old_perm
WHERE old_perm."key" LIKE 'invoice_%'
  AND EXISTS (
    SELECT 1
    FROM "permissions" sub
    WHERE sub."key" = 'subscription_' || substring(old_perm."key" from 9)
  );

-- 4. Renomeia eventuais chaves antigas sem equivalente (bancos incompletos).
UPDATE "permissions"
SET "key" = 'subscription_' || substring("key" from 9),
    "module" = 'Subscription',
    "title" = CASE substring("key" from 9)
      WHEN 'create' THEN 'Criar mensalidade'
      WHEN 'read' THEN 'Visualizar mensalidades'
      WHEN 'update' THEN 'Editar mensalidades'
      WHEN 'send_proof' THEN 'Enviar comprovante'
      ELSE "title"
    END,
    "description" = CASE substring("key" from 9)
      WHEN 'create' THEN 'Permite criar novas mensalidades'
      WHEN 'read' THEN 'Permite visualizar mensalidades existentes'
      WHEN 'update' THEN 'Permite editar mensalidades existentes'
      WHEN 'send_proof' THEN 'Permite enviar comprovante de pagamento da mensalidade'
      ELSE "description"
    END
WHERE "key" LIKE 'invoice_%'
  AND NOT EXISTS (
    SELECT 1
    FROM "permissions" sub
    WHERE sub."key" = 'subscription_' || substring("permissions"."key" from 9)
  );

COMMIT;
