## Context

O sistema atual de configurações de empresa possui duas tabelas: `company_settings` (definições globais) e `company_settings_usage` (ativação por empresa). As definições são definidas em arquivos TypeScript (`SettingsRef`) e sincronizadas via `PATCH /company-setting/sync`.

Problemas atuais:
- `company_settings` não possui coluna `module` para agrupar por módulo
- O sync usa `insert` e não atualiza metadados existentes
- Não há criação automática de usage rows na criação de empresa
- Não existe endpoint para o front-end consumir configurações ativas
- `companySettingId` está como `string` mas deveria ser `number`

## Goals / Non-Goals

**Goals:**
- Adicionar identificação de módulo às configurações
- Sincronização que atualiza metadados automaticamente
- Criação automática de configurações padrão ao criar empresa
- Endpoint para front-end consumir configurações ativas agrupadas por módulo
- Corrigir inconsistências de modelo

**Non-Goals:**
- Alterar o tipo de `isActive` (permanece boolean)
- Suportar configurações não-booleanas (número, texto)
- Remoção automática de configurações obsoletas
- Alterar a estrutura existente de permissions

## Decisions

### 1. Adicionar `module` em `CompanySettingEntity`

**Decisão:** Adicionar coluna `module` do tipo `varchar` na entidade `CompanySettingEntity` e incluir o campo `module` em cada objeto de `SettingsRef`.

**Alternativas consideradas:**
- Usar o nome da chave (ex: `Sale`) como módulo: Rejeitado porque não permite agrupamento flexível
- Criar tabela separada de módulos: Over-engineering para o caso de uso atual

**Razão:** Segue o padrão já estabelecido em `PermissionEntity` que possui campo `module`. Mantém consistência no projeto.

### 2. Usar `upsert` no sync

**Decisão:** Substituir `insert` por `upsert` no `CompanySettingService.sync()`, usando `key` como conflito.

**Alternativas consideradas:**
- Buscar e comparar cada registro: Mais complexo, menos performático
- Deletar e recriar: Perde dados existentes (usage rows)

**Razão:** `upsert` é nativo do TypeORM, atômico e resolve tanto inserção quanto atualização em uma única operação.

### 3. Criar usage rows na criação de empresa

**Decisão:** Adicionar chamada a `CompanySettingService.createDefaultUsageForCompany()` dentro da transação de `CreateCompanyService`.

**Alternativas consideradas:**
- Usar trigger no banco: Acoplamento demais com infraestrutura
- Criar fora da transação: Risco de empresa sem configs se a chamada falhar
- Deixar para o sync manual: Exige intervenção humana

**Razão:** Dentro da transação garante consistência. Empresa só é criada se suas configs também forem.

### 4. Endpoint `GET /company-setting-usage/me`

**Decisão:** Criar endpoint no `CompanySettingUsageController` que busca configurações ativas da empresa logada e retorna agrupadas por módulo.

**Alternativas consideradas:**
- Incluir no payload de autenticação: Aumenta tamanho do token, requer refresh
- Endpoint genérico `GET /company-setting-usage?companyUid=xxx`: Expor dados de outras empresas

**Razão:** Endpoint dedicado é mais seguro, retorna dados atualizados e não polui o token.

### 5. Proteção do sync com permissão admin

**Decisão:** Adicionar `@RequirePermission('admin_full_access')` no endpoint `PATCH /company-setting/sync`.

**Alternativas consideradas:**
- Deixar público: Risco de manipulação indevida
- Criar permissão específica: Over-engineering para operação de infraestrutura

**Razão:** Sincronização é operação de infraestrutura que afeta todas as empresas. Deve ser restrita a administradores.

## Risks / Trade-offs

- **Migração de dados:** Coluna `module` precisa de valor para registros existentes → Mitigação: Popular com dados do `SettingsRef` existente durante sync
- **Consistência:** Se sync não for rodado após deploy, metadados ficam desatualizados → Mitigação: Documentar necessidade de rodar sync após deploy
- **Performance:** Sync processa todas as empresas a cada chamada → Mitigação: Usar bulk operations e transação
- **Retrocompatibilidade:** Front-end precisa de adaptador para consumir novo formato → Mitigação: Documentar mudança no contrato da API

## Migration Plan

1. Deploy com `synchronize: true` (já habilitado) para criar coluna `module`
2. Rodar `PATCH /company-setting/sync` para popular dados existentes
3. Deploy da aplicação com código atualizado
4. Validar que empresas existentes possuem usage rows
5. Testar criação de nova empresa

**Rollback:** Remover coluna `module` e reverter código. Usage rows criadas não causam dados inconsistentes.
