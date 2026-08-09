## 1. Atualização das Entidades

- [x] 1.1 Adicionar coluna `module` em `CompanySettingEntity`
- [x] 1.2 Corrigir `companySettingId` para `number` em `CompanySettingUsageEntity`
- [x] 1.3 Corrigir typo `comany` → `company` em `CompanySettingUsageEntity`

## 2. Atualização dos Arquivos de Referência

- [x] 2.1 Adicionar campo `module` em `ProductSetting`
- [x] 2.2 Adicionar campo `module` em `SaleSetting`

## 3. Melhoria do Service de Configurações

- [x] 3.1 Refatorar `CompanySettingService.sync()` para usar `upsert` e incluir `module`
- [x] 3.2 Criar método `CompanySettingService.createDefaultUsageForCompany()`

## 4. Proteção do Endpoint de Sync

- [x] 4.1 Adicionar `@RequirePermission('admin_full_access')` em `CompanySettingController.sync()`

## 5. Endpoint para Front-end

- [x] 5.1 Criar `CompanySettingUsageService.findActiveByCompanyGrouped()`
- [x] 5.2 Criar endpoint `GET /company-setting-usage/me` em `CompanySettingUsageController`

## 6. Integração com Criação de Empresa

- [x] 6.1 Chamar `createDefaultUsageForCompany()` dentro da transação de `CreateCompanyService`

## 7. Validação e Testes

- [x] 7.1 Rodar typecheck e corrigir erros
- [x] 7.2 Testar sync atualiza metadados existentes
- [x] 7.3 Testar criação de empresa gera configurações padrão
- [x] 7.4 Testar endpoint `/company-setting-usage/me` retorna formato agrupado
