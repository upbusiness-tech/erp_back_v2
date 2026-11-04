-- Indices parciais de dashboard definidos nas migrations de dashboard.
-- Nao sao criados por synchronize; idempotente.

BEGIN;

CREATE INDEX IF NOT EXISTS "IDX_sales_dashboard_company_status_date"
  ON "sales" ("companyUid", "status", "createdAt", "id")
  WHERE "deletedAt" IS NULL;

CREATE INDEX IF NOT EXISTS "IDX_sales_items_dashboard_sale_product"
  ON "sales_items" ("saleId", "productId")
  WHERE "deletedAt" IS NULL;

CREATE INDEX IF NOT EXISTS "IDX_products_dashboard_company_id"
  ON "products" ("companyUid", "id")
  WHERE "deletedAt" IS NULL;

CREATE INDEX IF NOT EXISTS "IDX_product_specs_dashboard_product"
  ON "product_especifications" ("productId")
  WHERE "deletedAt" IS NULL;

CREATE INDEX IF NOT EXISTS "IDX_sale_payments_dashboard_sale_type"
  ON "sale_payments" ("saleId", "type")
  WHERE "deletedAt" IS NULL;

COMMIT;
