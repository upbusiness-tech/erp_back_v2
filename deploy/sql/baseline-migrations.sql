-- Baseline do controle de migrations.
-- Use quando o schema ja esta na cabeca (criado por synchronize) mas a tabela
-- "migrations" nao existe ou esta incompleta. Idempotente.

BEGIN;

CREATE TABLE IF NOT EXISTS "migrations" (
  "id" SERIAL NOT NULL,
  "timestamp" bigint NOT NULL,
  "name" varchar NOT NULL,
  CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY ("id")
);

INSERT INTO "migrations" ("timestamp", "name")
SELECT v."timestamp", v."name"
FROM (
  VALUES
    (1786213227793::bigint, 'AddSaleDiscountsAndSnapshots1786213227793'),
    (1786213227794::bigint, 'AddProductDashboardIndexes1786213227794'),
    (1786213227795::bigint, 'AddSalesDashboardIndexes1786213227795'),
    (1786827318000::bigint, 'AddCashFlowCode1786827318000'),
    (1787274676536::bigint, 'FixTopSellingProductsViewStatusFilter1787274676536'),
    (1787300000000::bigint, 'AddMultiUnitOfMeasureSupport1787300000000'),
    (1790478413976::bigint, 'RenameInvoicesToSubscriptions1790478413976'),
    (1791000000000::bigint, 'AddSaleDiscountShare1791000000000')
) AS v("timestamp", "name")
WHERE NOT EXISTS (
  SELECT 1 FROM "migrations" m WHERE m."name" = v."name"
);

COMMIT;
