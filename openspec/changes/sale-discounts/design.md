## Context

Veja `proposal.md` para a motivação. O ponto de partida relevante é:

- `SaleItemEntity` já possui uma coluna `discountPrice` do tipo `decimal`, mas ela não é utilizada em `calculateSaleItems()`.
- `CreateSaleService` calcula o valor do `CashFlowTransaction` usando `calculateSaleItems(sale.items)`, que ignora descontos e não inclui serviços.
- Nenhuma entidade de venda congela preços; os valores são lidos das entidades relacionadas em tempo real.

## Goals / Non-Goals

**Goals:**
- Adicionar desconto em três níveis: item, serviço e venda.
- Congelar preços e dados descritivos dos produtos no momento da venda.
- Calcular e persistir totais, troco e um resumo detalhado da venda.
- Validar limites de desconto e pagamento no momento da criação.
- Corrigir o valor registrado no fluxo de caixa para refletir o total real.

**Non-Goals:**
- Não criar uma tabela dedicada de histórico de preços (será tratada em change futura).
- Não implementar devoluções parciais nesta change (os snapshots habilitam isso futuramente).
- Não alterar o comportamento de estoque, apenas o cálculo financeiro.
- Não criar interface de configuração de regras de desconto (ex.: perfis de promotor, limites por usuário).

## Decisions

### Descontos como JSONB

**Decisão:** usar colunas JSONB para descontos em `sale`, `sale_item` e `sale_service`, com a forma `{ value, percent?, reason? }`.

**Racional:**
- Agrupa valor canônico, percentual de origem e motivo em uma única unidade sem multiplicar colunas.
- Facilita extensão futura (ex.: adicionar `authorizedBy`, `couponCode`) sem migração.

**Alternativas consideradas:**
- Colunas separadas (`discountValue`, `discountPercent`, `discountReason`): mais fáceis de indexar e validar no banco, mas mais verbosas e menos extensíveis. Optou-se pelo JSONB pela preferência expressa no contexto da discussão.

### Snapshot de preços denormalizado no `sale_item`

**Decisão:** adicionar colunas `salePriceSnapshot`, `specialPriceSnapshot`, `costPriceSnapshot` e `productSnapshot` (JSONB) em `sale_item`; adicionar `amountSnapshot` em `sale_service`.

**Racional:**
- Garante imutabilidade financeira sem introduzir uma tabela de histórico de preços nesta change.
- Separa atributos financeiros (colunas `numeric`) de atributos descritivos (`productSnapshot` JSONB), mantendo a possibilidade de consultas e constraints sobre valores monetários.

**Alternativas consideradas:**
- Tabela `product_price_history` com vigência: mais normalizada, mas maior complexidade e fora do escopo desta change.
- Snapshot completo em JSONB incluindo preços: perde tipagem, constraints e facilidade de relatórios sobre valores.

### Valor absoluto como canônico, percentual como metadado

**Decisão:** o campo `value` dentro do JSONB de desconto é a fonte da verdade financeira; `percent` é apenas informativo.

**Racional:**
- Evita ambiguidade de arredondamento ao aplicar percentuais sobre quantidades e totais.
- Torna o registro financeiro autocontido e auditável sem depender do preço vigente.

**Alternativas consideradas:**
- Usar apenas percentual e calcular o valor: problemático quando o preço base muda ou quando há necessidade de devolução parcial.

### Desconto global aplicado sobre subtotal

**Decisão:** o desconto da venda (`sale.discount.value`) reduz o subtotal já descontado de itens e serviços.

**Racional:**
- Alinhado com o comportamento esperado de PDV: descontos por linha primeiro, desconto global no final.
- Mantém a soma dos itens como base para margem por produto.

### Troco como valor derivado persistido

**Decisão:** calcular `change = amountPaid - total` no backend e persistir `total`, `amountPaid` e `change` na `sale`.

**Racional:**
- Facilita debug e auditoria, já que o estado da venda fica autocontido.
- O frontend pode calcular o troco em tempo real, mas o backend é a fonte da verdade.

### Migrations TypeORM

**Decisão:** usar migrations para adicionar colunas e ajustar tipos de colunas monetárias para `numeric(10,2)`.

**Racional:**
- Adicionar `precision`/`scale` a colunas existentes pode truncar valores; uma migration explícita documenta a alteração e permite validar dados antes.
- A remoção da coluna `discountPrice` deve ser feita via migration para não perder dados históricos (copiar valores existentes para `discountInfo.value` antes de remover).

## Risks / Trade-offs

- **[Risco] Cálculos de ponto flutuante** → **Mitigação:** usar `numeric(10,2)` no banco e tratar valores monetários como `string` (ou biblioteca como `decimal.js`) no TypeScript.
- **[Risco] Inconsistência entre JSONB e colunas financeiras** → **Mitigação:** centralizar a resolução de descontos e cálculo de totais em um único serviço/helper; validar que `discountInfo.value`/`discount.value` sejam não negativos.
- **[Risco] Vendas antigas sem snapshots** → **Mitigação:** manter o fallback de leitura das entidades relacionadas para consultas históricas, mas documentar que valores congelados só existem a partir desta change.
- **[Risco] Performance de queries sobre JSONB** → **Mitigação:** manter as colunas financeiras principais (`total`, `amountPaid`, `change`) como colunas indexáveis; usar JSONB apenas para metadados e snapshot descritivo.
- **[Trade-off] Nomenclatura inconsistente** → `sale_item` usa `discountInfo` enquanto `sale` e `sale_service` usam `discount`. Isso foi aceito para manter a referência do campo anterior (`discountPrice` virou `discountInfo.value`). Pode ser unificado futuramente.

## Migration Plan

1. Criar migration que adicione as novas colunas (`sale.discount`, `sale.total`, `sale.amountPaid`, `sale.change`, `sale.summary`, `sale_item.productSnapshot`, `sale_item.salePriceSnapshot`, `sale_item.specialPriceSnapshot`, `sale_item.costPriceSnapshot`, `sale_item.discountInfo`, `sale_service.amountSnapshot`, `sale_service.discount`).
2. Na mesma migration, alterar tipos de colunas monetárias existentes para `numeric(10,2)` (`sale_payment.amount`, `sale_service.amount`).
3. Copiar valores existentes de `sale_item.discountPrice` para `sale_item.discountInfo` com a forma `{ value: <valor> }`.
4. Remover a coluna `sale_item.discountPrice`.
5. Rollback: recriar `discountPrice`, copiar `discountInfo.value` de volta, remover colunas novas.

## Open Questions

- A aplicação de desconto global sobre itens com preço especial deve seguir alguma regra de negócio adicional (ex.: não permitir desconto global se houver preço especial)?
- O campo `reason` dos descontos deve ser obrigatório acima de determinado valor?
