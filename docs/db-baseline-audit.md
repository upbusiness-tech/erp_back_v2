# Auditoria de baseline dos bancos (2026-11-04)

Auditoria read-only executada antes do primeiro deploy de produção. Nenhuma
escrita foi feita nesta etapa. O objetivo é registrar o estado dos bancos de
staging e produção antes do baseline de migrations.

## Produção (`ep-fragrant-recipe-acaskobk-pooler.sa-east-1.aws.neon.tech`)

| Verificação | Resultado |
|---|---|
| Tabela de controle `migrations` | **ausente** |
| Migrations esperadas | 8 (todas refletidas no schema por `synchronize`) |
| `subscriptions` existe / `invoices` não existe | sim |
| Colunas de `saleDiscountShare`, `unitSold`, `discountInfo`, `amountPaid`, `summary`, `change` | presentes (12/12 verificadas) |
| Views (`view_company_details`, `view_cash_flow_transaction_stats`, `view_product_expanded_details`, `view_product_picture_gallery`, `view_product_transaction_details`, `view_top_selling_products`) | 6/6 presentes |
| Índices parciais de dashboard | **0 de 5** |
| `cash_flows` | 0 linhas; tabela `cash_flow_code_sequence` existe |
| `sales`, `sales_items`, `sales_services` | 0 linhas |
| Volume | 6 empresas, 16 usuários, 5 mensalidades, 53 permissões |
| Permissões legadas `invoice_*` | 4 chaves; 5 usuários vinculados; 2 funcionários vinculados **somente** às antigas |
| Permissões novas `subscription_*` | 4 chaves; 7 usuários vinculados |

Conclusão: schema na cabeça, sem dados transacionais a migrar. Não é preciso
rodar migration para o deploy. Falta apenas registrar o baseline (tabela
`migrations`), criar os índices parciais e consolidar as permissões legadas.

## Staging (`ep-steep-king-ac2rs3nj-pooler.sa-east-1.aws.neon.tech`)

| Verificação | Resultado |
|---|---|
| Tabela `migrations` | existe, com **5 de 8** registros |
| Registros ausentes | `FixTopSellingProductsViewStatusFilter`, `RenameInvoicesToSubscriptions`, `AddSaleDiscountShare` |
| Índices parciais de dashboard | **0 de 5** |
| Permissões legadas `invoice_*` | mesmas 4 chaves; 5 usuários vinculados; 2 funcionários somente nas antigas |
| Permissões novas `subscription_*` | mesmas 4 chaves; 7 usuários vinculados |

Conclusão: staging está no mesmo estado de dados de produção, mas com o
controle de migrations incompleto. O comando `make migrate ENV=staging`
tentaria reaplicar as 3 migrations faltantes; a de renomeação falharia porque
`invoices` não existe mais. Executar o baseline também em staging.

## Como repetir a auditoria

```sql
-- Controle de migrations
SELECT id, timestamp, name FROM migrations ORDER BY id;

-- Permissões legadas
SELECT key, module FROM permissions WHERE key LIKE 'invoice_%' OR key LIKE 'subscription_%' ORDER BY key;
SELECT p.key, count(*) FROM user_permissions up
  JOIN permissions p ON p.id = up.permission_id
 WHERE p.key LIKE 'invoice_%' OR p.key LIKE 'subscription_%'
 GROUP BY p.key ORDER BY p.key;

-- Dados transacionais
SELECT 'sales' t, count(*) FROM sales UNION ALL
SELECT 'sales_items', count(*) FROM sales_items UNION ALL
SELECT 'sales_services', count(*) FROM sales_services UNION ALL
SELECT 'cash_flows', count(*) FROM cash_flows;

-- Views
SELECT table_name FROM information_schema.views
 WHERE table_schema = 'public' AND table_name LIKE 'view_%' ORDER BY table_name;

-- Índices parciais
SELECT indexname FROM pg_indexes
 WHERE schemaname = 'public'
   AND indexname IN (
     'IDX_sales_dashboard_company_status_date',
     'IDX_sales_items_dashboard_sale_product',
     'IDX_products_dashboard_company_id',
     'IDX_product_specs_dashboard_product',
     'IDX_sale_payments_dashboard_sale_type'
   );
```

## Observação

O banco de produção foi criado por `synchronize` manual. Por isso o schema
existe, mas as migrations de dados (`invoice_*`, backfills de desconto e
códigos de caixa) não foram executadas. O baseline em `deploy/sql/` corrige o
controle de migrations, os índices e as permissões de forma idempotente.

## Execução do baseline (2026-11-04)

Snapshots lógicos criados com `pg_dump -Fc` antes de qualquer escrita:

- `.tmp/backups/producao-20261104-035340.dump` (160K)
- `.tmp/backups/staging-20261104-035352.dump` (168K)

Resultado do `make db-baseline`:

| Verificação | Staging | Produção |
|---|---|---|
| Registros em `migrations` | 8 (3 inseridos) | 8 (8 inseridos) |
| Índices parciais criados | 5 | 5 |
| Chaves `invoice_*` restantes | 0 (4 removidas) | 0 (4 removidas) |
| Vínculos repontados | 3 | 3 |
| `make migrate` | `No migrations are pending` | `No migrations are pending` |

O baseline foi idempotente: reexecuções não duplicam migrations nem índices.

## Implantação

- Serviço de produção criado em `erp-v2-prod`: revisão `erp-api-00001-92k`,
  21 variáveis de ambiente, `/health` com `database:connected`.
- Staging republicado na revisão `erp-api-00026-5c8` com `NODE_ENV=production`
  e `CORS_ORIGINS` de staging.
- Rollback testado em produção: `00002-nkk` → `00001-92k` → `00002-nkk`, com
  `/health` saudável em todas as etapas.
- CORS de produção validado: `access-control-allow-origin` ecoa
  `https://uperp-v2-production.vercel.app`.
