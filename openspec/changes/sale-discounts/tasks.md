## 1. Database Migrations

- [x] 1.1 Criar migration que adicione as colunas `discount`, `total`, `amountPaid`, `change` e `summary` na tabela `sales`.
- [x] 1.2 Criar migration que adicione as colunas `productSnapshot`, `salePriceSnapshot`, `specialPriceSnapshot`, `costPriceSnapshot` e `discountInfo` na tabela `sales_items`.
- [x] 1.3 Criar migration que adicione as colunas `amountSnapshot` e `discount` na tabela `sales_services`.
- [x] 1.4 Alterar tipos das colunas monetárias existentes para `numeric(10,2)` (`sale_payments.amount`, `sales_services.amount`).
- [x] 1.5 Copiar valores existentes de `sales_items.discountPrice` para `sales_items.discountInfo` no formato `{ value: <valor> }`.
- [x] 1.6 Remover a coluna `sales_items.discountPrice`.

## 2. Entities and Types

- [x] 2.1 Atualizar `SaleEntity` com os novos campos (`discount`, `total`, `amountPaid`, `change`, `summary`).
- [x] 2.2 Atualizar `SaleItemEntity` com os novos campos de snapshot e `discountInfo`; remover `discountPrice`.
- [x] 2.3 Atualizar `SaleServiceEntity` com `amountSnapshot` e `discount`.
- [x] 2.4 Criar interfaces TypeScript para os JSONBs (`DiscountInfo`, `SaleSummary`, `ProductSnapshot`).
- [x] 2.5 Adicionar transformer/class-validator para garantir a shape dos JSONBs nas entidades.

## 3. DTOs

- [x] 3.1 Adicionar `discountInfo` opcional em `CreateSaleItemDto` com validação de shape.
- [x] 3.2 Adicionar `discount` opcional em `CreateSaleServiceDto` com validação de shape.
- [x] 3.3 Adicionar `discount` opcional em `CreateSaleDto` com validação de shape.
- [x] 3.4 Validar que `value`, quando informado, seja não negativo nos três DTOs.

## 4. Calculation Utilities

- [x] 4.1 Atualizar `calculateSaleItems` para usar snapshots e descontos de linha.
- [x] 4.2 Criar `calculateSaleServices` para calcular total líquido dos serviços com descontos.
- [x] 4.3 Criar `calculateSaleTotals` para computar subtotal, total, troco e montar o objeto `summary`.
- [x] 4.4 Garantir que todos os cálculos usem `string` ou biblioteca decimal para evitar erros de ponto flutuante.

## 5. CreateSaleService

- [x] 5.1 Resolver snapshots de preço e produto para cada item antes de salvar.
- [x] 5.2 Resolver `amountSnapshot` para cada serviço antes de salvar.
- [x] 5.3 Calcular totais e troco após resolver itens, serviços, descontos e pagamentos.
- [x] 5.4 Validar limites de desconto (item, serviço, global) e pagamento suficiente.
- [x] 5.5 Persistir `sale.total`, `sale.amountPaid`, `sale.change` e `sale.summary`.
- [x] 5.6 Corrigir o valor do `CashFlowTransaction` para usar o total final da venda.

## 6. Validation and Edge Cases

- [x] 6.1 Implementar validação de que `discountInfo.value` não exceda o valor bruto da linha do item.
- [x] 6.2 Implementar validação de que `service.discount.value` não exceda `amountSnapshot`.
- [x] 6.3 Implementar validação de que `sale.discount.value` não exceda o subtotal.
- [x] 6.4 Implementar validação de que a soma dos pagamentos seja maior ou igual ao total da venda.
- [x] 6.5 Garantir que venda não fique com valor negativo em nenhum cenário.

## 7. Tests

- [x] 7.1 Adicionar testes unitários para `calculateSaleItems`, `calculateSaleServices` e `calculateSaleTotals`.
- [x] 7.2 Adicionar testes de integração para criação de venda com desconto por item.
- [x] 7.3 Adicionar testes de integração para criação de venda com desconto por serviço.
- [x] 7.4 Adicionar testes de integração para criação de venda com desconto global e troco.
- [x] 7.5 Adicionar testes de integração para validação de descontos excedentes e pagamento insuficiente.
- [x] 7.6 Adicionar teste de integração que verifica se o `CashFlowTransaction` reflete o total final com descontos e serviços.

## 8. Documentation and Cleanup

- [x] 8.1 Documentar no CHANGELOG ou README a alteração de contrato dos DTOs de criação de venda.
- [x] 8.2 Verificar se há referências à coluna removida `discountPrice` em outros módulos e atualizar.
- [x] 8.3 Executar `openspec validate --change sale-discounts` e corrigir problemas reportados.
