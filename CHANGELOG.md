# Changelog

## [Unreleased]

### Added

- Suporte a descontos em vendas:
  - Desconto por linha nos itens (`CreateSaleItemDto.discountInfo`).
  - Desconto por serviço (`CreateSaleServiceDto.discount`).
  - Desconto global na venda (`CreateSaleDto.discount`).
- Snapshot de preços e dados do produto no momento da venda (`sale_item` e `sale_service`).
- Cálculo e persistência de totais, troco e resumo da venda (`sale.total`, `sale.amountPaid`, `sale.change`, `sale.summary`).
- Validação de limites de desconto e pagamento mínimo.

### Changed

- **BREAKING**: `CreateSaleItemDto` não possui mais `discountPrice`. Use `discountInfo.value`.
- `CreateSaleService` agora congela preços e calcula o total real da venda, incluindo serviços e descontos.
- Valor do `CashFlowTransaction` passa a refletir o total final da venda (itens + serviços − descontos).

### Removed

- Coluna `discountPrice` da tabela `sales_items` (dados migrados para `discountInfo`).
