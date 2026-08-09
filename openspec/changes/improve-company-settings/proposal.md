## Why

As configurações de empresa (`company_settings`) controlam comportamentos do sistema, especialmente no front-end, mas hoje não possuem identificação de módulo, não são atualizadas automaticamente quando os metadados mudam no código e, principalmente, não são criadas automaticamente ao criar uma empresa. Isso exige sincronização manual e deixa empresas novas sem configurações padrão.

## What Changes

- Adicionar coluna `module` em `CompanySettingEntity` para agrupar configurações por módulo (Product, Sale, etc.)
- Melhorar o endpoint `PATCH /company-setting/sync` para usar `upsert`, garantindo que alterações em `description`, `default` e `plan` sejam refletidas no banco
- Proteger o endpoint de sync com permissão de admin
- Criar automaticamente as linhas de `company_settings_usage` dentro da transação de criação de empresa
- Criar endpoint `GET /company-setting-usage/me` que retorna as configurações ativas da empresa logada, agrupadas por módulo
- Corrigir problemas de modelo: tipo de `companySettingId` (`number` ao invés de `string`) e typo `comany` → `company`

## Capabilities

### New Capabilities

- `company/company-settings`: Gestão de configurações de empresa — definições globais por módulo, sincronização com o código-fonte e ativação automática na criação de empresa.

### Modified Capabilities

- (nenhum — não há specs existentes)

## Impact

- Banco: coluna nova `module` em `company_settings`; sincronização automática recria/atualiza metadados
- API: novo endpoint `GET /company-setting-usage/me`; `PATCH /company-setting/sync` passa a exigir permissão admin
- Criação de empresa: passa a incluir geração de `company_settings_usage` dentro da transação
- Front-end: poderá consumir configurações agrupadas por módulo para ligar/desligar comportamentos
