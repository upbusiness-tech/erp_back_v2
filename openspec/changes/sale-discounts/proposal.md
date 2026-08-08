## Why

O sistema de vendas atual não aplica descontos de forma estruturada: a coluna `discountPrice` de `sale_item` existe mas é ignorada no cálculo do total, não há desconto por serviço nem desconto global na venda, e os preços dos itens vendidos não são congelados no momento da venda. Isso impede devoluções parciais, relatórios de margem e auditoria correta quando os preços dos produtos mudam. Esta change introduz descontos em três níveis (item, serviço e venda) e armazena snapshots de preço para garantir a imutabilidade financeira das vendas.

## What Changes

- Adicionar suporte a desconto absoluto por linha nos itens da venda via JSONB `discountInfo` (remove a coluna `discountPrice` isolada).
- Adicionar suporte a desconto em serviços via JSONB `discount`.
- Adicionar desconto global na venda via JSONB `discount` aplicado sobre o subtotal de itens + serviços.
- Congelar preços e dados do produto no momento da venda com colunas de snapshot em `sale_item` e `sale_service`.
- Calcular e persistir totais da venda (`total`, `amountPaid`, `change`) e um resumo detalhado (`summary`) para auditoria e debug.
- Validar que nenhum desconto exceda sua base e que o pagamento seja suficiente (permitindo troco).
- Corrigir o valor do `CashFlowTransaction` para refletir o total real da venda, incluindo serviços e descontos.
- **BREAKING**: o contrato de criação de venda passa a aceitar objetos de desconto nos DTOs de item, serviço e venda.

## Capabilities

### New Capabilities

- `sale-discounts`: suporte a descontos por item, por serviço e global na venda, com snapshots de preço e cálculo de troco.

### Modified Capabilities

- Nenhuma capability existente é alterada em nível de requisito (não há specs prévias no projeto).

## Impact

- Entidades: `SaleEntity`, `SaleItemEntity`, `SaleServiceEntity`, `SalePaymentEntity`.
- Serviço: `CreateSaleService` e utilitários de cálculo em `saleFormulas.ts`.
- DTOs: `CreateSaleDto`, `CreateSaleItemDto`, `CreateSaleServiceDto`.
- Integração: `CashFlowTransaction` criado no fluxo de venda.
- Frontend: precisa enviar os novos campos de desconto quando o operador aplicar descontos; snapshots e totais continuam sendo calculados no backend.
