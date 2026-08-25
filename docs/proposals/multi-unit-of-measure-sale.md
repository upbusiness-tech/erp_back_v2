# Proposta: Suporte a Múltiplas Unidades de Medida na Venda e Estoque

**Status:** Proposta  
**Data:** 2026-08-23  
**Escopo:** Backend (NestJS + TypeORM + PostgreSQL)

---

## 1. Contexto

O sistema de ERP hoje só processa vendas de produtos com unidade de medida "Unidade" (peças inteiras). Produtos com unidade em Gramas, Metros ou Litros precisam de tratamento diferente no fluxo de venda e controle de estoque.

**Exemplo real:** Um queijo é vendido por kg (salePrice: R$ 35/kg). Na venda, o cliente compra 2 queijos de 560g cada. O sistema precisa:
- Registrar que foram 2 itens × 0.560 kg = 1.120 kg total
- Subtrair 1.120 do estoque (que está em kg)
- Calcular lucro: (preço - custo) × 1.120 kg

---

## 2. Modelo de Dados Atual vs Proposto

### 2.1 product_especifications (estoque)

```
ANTES:                                  DEPOIS:
┌──────────────────────────┐           ┌──────────────────────────┐
│ stockQuantity: @Column() │           │ stockQuantity: @Column(  │
│ (integer, sem type)      │    ──▶    │   type: 'decimal',       │
│                          │           │   precision: 10,         │
│                          │           │   scale: 3               │
│                          │           │ )                        │
└──────────────────────────┘           └──────────────────────────┘
```

### 2.2 sales_items (itens da venda)

```
ANTES:                                  DEPOIS:
┌──────────────────────────┐           ┌──────────────────────────┐
│ quantitySold: @Column()  │           │ quantitySold: @Column(   │
│ (integer, sem type)      │           │   type: 'decimal',       │
│                          │    ──▶    │   precision: 10,         │
│                          │           │   scale: 2               │
│                          │           │ )                        │
│                          │           │ unitSold: @Column(       │
│                          │           │   type: 'decimal',       │
│                          │           │   precision: 10,         │
│                          │           │   scale: 3               │
│                          │           │ )                        │
│                          │           │ unitOfMeasure: @Column(  │
│                          │           │   type: 'varchar'        │
│                          │           │ )                        │
└──────────────────────────┘           └──────────────────────────┘
```

### 2.3 product_transactions_records (movimentações de estoque)

```
ANTES:                                  DEPOIS:
┌──────────────────────────┐           ┌──────────────────────────┐
│ value: @Column({type:    │           │ value: @Column({         │
│   'int'})                │    ──▶    │   type: 'decimal',       │
│                          │           │   precision: 10,         │
│                          │           │   scale: 3               │
│                          │           │ })                       │
└──────────────────────────┘           └──────────────────────────┘
```

---

## 3. Regra de Negócio

### Cálculo de estoque subtraído/devolvido

```
totalVendido = quantitySold × unitSold

Exemplo:
  quantitySold = 2    (2 queijos)
  unitSold = 0.560    (560g cada)
  totalVendido = 2 × 0.560 = 1.120 kg
```

### Preço de venda

O `salePrice` e `costPrice` em `product_especifications` representam o preço **por unidade de medida base** do produto:
- Produto em Gramas → salePrice = preço por grama (ou por kg, dependendo do cadastro)
- Produto em Metro → salePrice = preço por metro
- Produto em Litro → salePrice = preço por litro
- Produto em Unidade → salePrice = preço por unidade (unitSold = 1)

### Fórmula de cálculo por linha

```
gross = salePrice × quantitySold × unitSold
profit = (salePrice - costPrice) × quantitySold × unitSold
```

### Validação de estoque

```
estoqueDisponível = stockQuantity
necessário = quantitySold × unitSold

se isStockControlled AND estoqueDisponível < necessário:
  ERRO "Estoque insuficiente"
```

### Baixa de estoque (SQL atômico)

```sql
UPDATE product_especifications
SET stockQuantity = stockQuantity - (quantitySold * unitSold)
WHERE id = :specId
  AND stockQuantity >= (quantitySold * unitSold)
```

### Cancelamento de venda (devolução ao estoque)

```sql
UPDATE product_especifications
SET stockQuantity = stockQuantity + (quantitySold * unitSold)
WHERE id = :specId
```

---

## 4. Arquivos a Alterar

### 🔴 Alta Prioridade (Core)

| # | Arquivo | Mudança |
|---|---------|---------|
| 1 | `src/modules/sale/submodules/saleItem/saleItem.entity.ts` | `quantitySold` → `decimal(10,2)`. Adicionar `unitSold: decimal(10,3)` e `unitOfMeasure: varchar` |
| 2 | `src/modules/product/submodules/productEspecification/productEspecification.entity.ts` | `stockQuantity` → `decimal(10,3)` |
| 3 | `src/modules/product/submodules/productTransaction/productTransactionRecords.entity.ts` | `value: int` → `decimal(10,3)` |
| 4 | `src/modules/sale/domain/createSale.service.ts` | Atualizar: lucro (L114-116), validação estoque (L139-146), baixa estoque (L206-214), registro transação (L222-224), snapshot do item (L120-126) |
| 5 | `src/modules/sale/domain/cancelSale.service.ts` | Devolução estoque (L68): `quantitySold × unitSold` |

### 🟡 Média Prioridade (DTOs e Fórmulas)

| # | Arquivo | Mudança |
|---|---------|---------|
| 6 | `src/modules/sale/dto/createSale.dto.ts` | Adicionar `unitSold: @IsNumber() @IsPositive()` e `unitOfMeasure: @IsEnum(ProductUnitOfMeasure)` ao `CreateSaleItemDto` |
| 7 | `src/modules/sale/util/saleFormulas.ts` | `gross = unitPrice × quantitySold × unitSold` (L15) |
| 8 | `src/modules/product/submodules/productTransaction/dto/createProductTransactionRecord.dto.ts` | `value` mantém `@IsNumber()`, sem mudança de tipo |

### 🟡 Relatórios e Views

| # | Arquivo | Mudança |
|---|---------|---------|
| 9 | `src/modules/report/productDashboard/productDashboard.service.ts` | Queries: `SUM(quantitySold)` → `SUM(quantitySold × unitSold)` (L135, 182, 218, 237). Lucro e turnover (L137, 184, 189, 220, 241) |
| 10 | `src/views/product/viewTopSellingProducts.entity.ts` | SQL da view: incluir `× "unitSold"` em todas as expressões com `quantitySold` (L15-16) |

### 🟢 Testes

| # | Arquivo | Mudança |
|---|---------|---------|
| 11 | `src/modules/sale/domain/createSale.service.spec.ts` | Adicionar `unitSold` e `unitOfMeasure` ao mockSpec e buildBaseDto |
| 12 | `src/modules/sale/domain/cancelSale.service.spec.ts` | Adicionar `unitSold` aos itens. Verificar cálculo `quantitySold × unitSold` |
| 13 | `src/modules/sale/util/saleFormulas.spec.ts` | Adicionar `unitSold` ao makeItem. Testar com unitSold ≠ 1 |
| 14 | `src/modules/report/productDashboard/productDashboard.service.spec.ts` | Atualizar mocks |

---

## 5. Migration

```sql
-- 1. Alterar stockQuantity para decimal
ALTER TABLE product_especifications
  ALTER COLUMN "stockQuantity" TYPE numeric(10,3)
  USING "stockQuantity"::numeric(10,3);

-- 2. Alterar quantitySold para decimal e adicionar colunas novas
ALTER TABLE sales_items
  ALTER COLUMN "quantitySold" TYPE numeric(10,2)
  USING "quantitySold"::numeric(10,2),
  ADD COLUMN IF NOT EXISTS "unitSold" numeric(10,3) NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "unitOfMeasure" varchar NOT NULL DEFAULT 'Unidade';

-- 3. Alterar value para decimal
ALTER TABLE product_transactions_records
  ALTER COLUMN "value" TYPE numeric(10,3)
  USING "value"::numeric(10,3);

-- 4. Atualizar vendas antigas: unitSold = 1, unitOfMeasure baseado no produto
UPDATE sales_items si
SET
  "unitSold" = 1,
  "unitOfMeasure" = p."unitOfMeasure"
FROM products p
WHERE si."productId" = p.id
  AND si."unitSold" IS NULL;
```

---

## 6. DTO — CreateSaleItemDto (Antes vs Depois)

```typescript
// ANTES
export class CreateSaleItemDto {
  note: string;
  quantitySold: number;        // @IsNumber() @IsPositive()
  isEspecialPrice: boolean;
  internCustomerPriceId: number;
  productId: number;
  productEspecificationId: number;
  discountInfo: DiscountInfoDto;
}

// DEPOIS
export class CreateSaleItemDto {
  note: string;
  quantitySold: number;        // @IsNumber() @IsPositive()
  unitSold: number;            // @IsNumber() @IsPositive()  [NOVO]
  unitOfMeasure: ProductUnitOfMeasure; // @IsEnum() @IsNotEmpty()  [NOVO]
  isEspecialPrice: boolean;
  internCustomerPriceId: number;
  productId: number;
  productEspecificationId: number;
  discountInfo: DiscountInfoDto;
}
```

---

## 7. Exemplos de Uso

### Produto em Unidade (queijo inteiro)
```json
{
  "quantitySold": 2,
  "unitSold": 1,
  "unitOfMeasure": "Unidade"
}
// estoque subtraído: 2 × 1 = 2 unidades
```

### Produto em Gramas (queijo fatiado)
```json
{
  "quantitySold": 2,
  "unitSold": 0.560,
  "unitOfMeasure": "Gramas"
}
// estoque subtraído: 2 × 0.560 = 1.120 kg
```

### Produto em Metro (filme plástico)
```json
{
  "quantitySold": 1,
  "unitSold": 2.500,
  "unitOfMeasure": "Metro"
}
// estoque subtraído: 1 × 2.500 = 2.500 metros
```

### Produto em Litro (leite)
```json
{
  "quantitySold": 3,
  "unitSold": 1.000,
  "unitOfMeasure": "Litro"
}
// estoque subtraído: 3 × 1.000 = 3.000 litros
```

---

## 8. Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| Vendas antigas sem unitSold | Default 1 + copiar unitOfMeasure do produto |
| Precisão de ponto flutuante JS | `round2()` em cálculos monetários; `decimal(10,3)` no Postgres é exato |
| Frontend precisa enviar unitSold | Obrigatório no DTO, validação @IsNumber() @IsPositive() |
| Dashboard quebra com queries antigas | Atualizar todas as queries SQL para incluir `× unitSold` |
| Ajuste manual de estoque | O `value` do DTO representa a quantidade total na unidade do produto |

---

## 9. Ordem de Implementação

1. **Migration** — Alterar tipos de colunas no banco
2. **Entidades** — Atualizar TypeORM decorators
3. **DTOs** — Adicionar unitSold e unitOfMeasure
4. **Service de venda** — Atualizar lógica de cálculo, validação e baixa
5. **Service de cancelamento** — Atualizar devolução ao estoque
6. **Fórmulas** — Atualizar calculateItemLine
7. **Dashboard/Reports** — Atualizar queries SQL
8. **Views** — Atualizar view SQL
9. **Testes** — Atualizar todos os specs
