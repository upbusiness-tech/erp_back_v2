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
- Preço unitário negociado por item (`CreateSaleItemDto.specialPrice`), persistido em `sales_items.specialPriceSnapshot` sem alterar o preço de catálogo.
- Snapshot opcional de cliente avulso na venda (`sales.isolatedCustomer`) com `name`, `type`, `address` e `phoneNumber`.
- Validações de exclusividade entre cliente cadastrado/avulso e entre preço negociado/preço especial de tabela.
- Lucro e receita passam a considerar o preço negociado pelos snapshots já existentes.
- Configuração de empresa `negotiated_sale_price` (padrão desativada) para controlar a exibição da ação de preço negociado no frontend.
- Coluna `sales_items.specialPriceSource` (`CATALOG`/`CUSTOMER_TABLE`/`NEGOTIATED`) com backfill para auditoria da origem do preço especial.

### Changed

- **BREAKING**: `CreateSaleItemDto` não possui mais `discountPrice`. Use `discountInfo.value`.
- `CreateSaleService` agora congela preços e calcula o total real da venda, incluindo serviços e descontos.
- Valor do `CashFlowTransaction` passa a refletir o total final da venda (itens + serviços − descontos).
- `CreateSaleItemDto.isEspecialPrice` passa a ser opcional; o backend deriva o indicador a partir do preço informado.
- `POST /sale` passa a aceitar `isolatedCustomer` na venda e `specialPrice` por item.
- `CreateSaleService` passa a rejeitar `internCustomerPriceId` inexistente em vez de usar silenciosamente o preço de catálogo.

### Removed

- Coluna `discountPrice` da tabela `sales_items` (dados migrados para `discountInfo`).
