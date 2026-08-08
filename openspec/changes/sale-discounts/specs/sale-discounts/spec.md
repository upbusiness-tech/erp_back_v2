## Purpose

Permitir que vendas registrem descontos por item, por serviço e de forma global, sempre congelando os preços e dados dos produtos no momento da venda para garantir a imutabilidade financeira e a correta auditoria posterior.

## ADDED Requirements

### Requirement: Item line discount
O sistema DEVE permitir que cada item de uma venda tenha um desconto absoluto aplicado sobre o valor total da linha, independentemente da quantidade vendida.

#### Scenario: Item with line discount
- **WHEN** uma venda é criada com um item cujo preço aplicado é R$ 50,00 por unidade, quantidade 2 e desconto de linha de R$ 10,00
- **THEN** o valor líquido da linha DEVE ser R$ 90,00

#### Scenario: Item discount cannot exceed line gross amount
- **WHEN** uma venda é criada com um item cujo valor bruto da linha é R$ 30,00 e desconto de linha informado é R$ 35,00
- **THEN** o sistema DEVE rejeitar a operação com erro de validação

### Requirement: Service discount
O sistema DEVE permitir que cada serviço de uma venda tenha um desconto absoluto aplicado sobre o valor do serviço.

#### Scenario: Service with discount
- **WHEN** uma venda do tipo serviço é criada com um serviço de R$ 80,00 e desconto de R$ 15,00
- **THEN** o valor líquido do serviço DEVE ser R$ 65,00

#### Scenario: Service discount cannot exceed service amount
- **WHEN** uma venda é criada com um serviço de R$ 40,00 e desconto informado é R$ 45,00
- **THEN** o sistema DEVE rejeitar a operação com erro de validação

### Requirement: Sale-level discount
O sistema DEVE permitir um desconto global na venda aplicado sobre o subtotal de itens e serviços, após os descontos de linha e de serviço.

#### Scenario: Sale-level discount over items and services
- **WHEN** uma venda é criada com total líquido de itens de R$ 90,00, total líquido de serviços de R$ 65,00 e desconto global de R$ 20,00
- **THEN** o total da venda DEVE ser R$ 135,00

#### Scenario: Sale-level discount cannot exceed subtotal
- **WHEN** uma venda é criada com subtotal de R$ 100,00 e desconto global informado de R$ 110,00
- **THEN** o sistema DEVE rejeitar a operação com erro de validação

### Requirement: Price snapshot at sale time
O sistema DEVE congelar o preço do produto, o preço especial do cliente interno e os dados descritivos do produto no item da venda no momento da criação, de forma que alterações futuras nos produtos não afetem vendas já registradas.

#### Scenario: Product price changes after sale
- **WHEN** uma venda é criada com um produto cujo preço é R$ 50,00 e, posteriormente, o preço do produto é alterado para R$ 60,00
- **THEN** o valor da venda registrada DEVE continuar sendo calculado com base em R$ 50,00

#### Scenario: Special price snapshot
- **WHEN** uma venda é criada com preço especial de R$ 45,00 para um cliente interno
- **THEN** o item DAVERÁ armazenar R$ 45,00 como preço especial congelado, mesmo que o preço especial seja alterado depois

### Requirement: Payment amount validation
O sistema DEVE validar que o valor total dos pagamentos seja maior ou igual ao total da venda, calculando e registrando o troco quando o pagamento for superior.

#### Scenario: Payment with change
- **WHEN** uma venda com total de R$ 88,00 é paga com R$ 100,00
- **THEN** a venda DEVE ser criada com troco de R$ 12,00

#### Scenario: Insufficient payment
- **WHEN** uma venda com total de R$ 100,00 é paga com R$ 90,00
- **THEN** o sistema DEVE rejeitar a operação com erro de validação

### Requirement: Discount metadata
O sistema DEVE permitir que descontos registrem metadados opcionais, incluindo percentual de origem e motivo, sem que o percentual seja usado como valor canônico no cálculo financeiro.

#### Scenario: Discount with percentage metadata
- **WHEN** um desconto de R$ 10,00 é aplicado em uma linha e o metadado informa 10% de origem
- **THEN** o valor financeiro usado no cálculo DEVE ser R$ 10,00 e o percentual DEVE ser preservado apenas para consulta

### Requirement: Cash flow transaction reflects final total
O sistema DEVE registrar o valor da transação de fluxo de caixa da venda como o total final da venda, incluindo serviços e deduzindo todos os descontos.

#### Scenario: Cash flow with discounts and services
- **WHEN** uma venda é criada com itens líquidos de R$ 90,00, serviços líquidos de R$ 65,00 e desconto global de R$ 20,00
- **THEN** a transação de fluxo de caixa gerada DEVE ter valor de R$ 135,00
