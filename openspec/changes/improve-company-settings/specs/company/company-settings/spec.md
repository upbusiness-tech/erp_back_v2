## Purpose

Gerenciar configurações de empresa como definições globais agrupadas por módulo, sincronizadas com o código-fonte e ativadas automaticamente para cada empresa ao ser criada.

## ADDED Requirements

### Requirement: Configurações devem ser identificadas por módulo

Cada configuração de empresa SHALL possuir um campo `module` que identifica a que módulo do sistema pertence (ex: "Product", "Sale").

#### Scenario: Configuração com módulo válido

- **WHEN** uma configuração é criada ou sincronizada com o código-fonte
- **ENTÃO** o campo `module` SHALL estar presente e correspondente ao grupo de configuração definido em `SettingsRef`

### Requirement: Sincronização deve atualizar metadados existentes

O endpoint `PATCH /company-setting/sync` SHALL usar `upsert` para sincronizar definições de configuração do código-fonte com o banco de dados, atualizando automaticamente campos como `description`, `default` e `plan` quando alterados.

#### Scenario: Atualização de metadados existentes

- **WHEN** o endpoint de sincronização é chamado e uma configuração já existe no banco com metadados diferentes do código-fonte
- **ENTÃO** os campos `description`, `default`, `plan` e `module` SHALL ser atualizados no banco

#### Scenario: Nova configuração adicionada ao código

- **WHEN** uma nova configuração é adicionada a `SettingsRef` e o endpoint de sincronização é chamado
- **ENTÃO** uma nova linha SHALL ser inserida em `company_settings` com todos os metadados

### Requirement: Sincronização deve criar linhas de uso para empresas existentes

O endpoint de sincronização SHALL criar automaticamente linhas em `company_settings_usage` para empresas que ainda não possuem uma configuração, respeitando o plano da empresa.

#### Scenario: Empresa sem uso da nova configuração

- **WHEN** uma nova configuração é sincronizada e existe uma empresa elegível (mesmo plano) que não possui uso para essa configuração
- **ENTÃO** uma nova linha SHALL ser inserida em `company_settings_usage` com `isActive` igual ao valor default da configuração

#### Scenario: Empresa com plano incompatível

- **WHEN** a configuração possui um plano específico e a empresa não possui esse plano
- **ENTÃO** nenhuma linha de uso SHALL ser criada para essa empresa

### Requirement: Criação de empresa deve gerar configurações padrão

Ao criar uma empresa, o sistema SHALL criar automaticamente as linhas de `company_settings_usage` dentro da mesma transação, respeitando o plano da empresa e os valores default das configurações.

#### Scenario: Empresa criada com configurações padrão

- **WHEN** uma nova empresa é criada com um plano específico
- **ENTÃO** linhas SHALL serem inseridas em `company_settings_usage` para todas as configurações elegíveis pelo plano, com `isActive` igual ao valor default

#### Scenario: Empresa criada com plano diferente

- **WHEN** a empresa é criada com um plano que não corresponde ao plano de uma configuração
- **ENTÃO** nenhuma linha de uso SHALL ser criada para essa configuração

### Requirement: Endpoint para obter configurações ativas da empresa

O sistema SHALL disponibilizar um endpoint `GET /company-setting-usage/me` que retorna as configurações ativas da empresa logada, agrupadas por módulo.

#### Scenario: Empresa com configurações ativas

- **WHEN** a empresa logada possui configurações ativas em diferentes módulos
- **ENTÃO** o endpoint SHALL retornar um objeto onde as chaves são os módulos e os valores são objetos com as configurações ativas

#### Scenario: Empresa sem configurações

- **WHEN** a empresa logada não possui nenhuma configuração ativa
- **ENTÃO** o endpoint SHALL retornar um objeto vazio ou com arrays vazios por módulo

### Requirement: Sincronização deve ser protegida por permissão

O endpoint `PATCH /company-setting/sync` SHALL exigir permissão de administrador para ser acessado.

#### Scenario: Acesso sem permissão de admin

- **WHEN** um usuário não administrador tenta acessar o endpoint de sincronização
- **ENTÃO** o sistema SHALL retornar erro de acesso negado (403)

#### Scenario: Acesso com permissão de admin

- **WHEN** um usuário administrador acessa o endpoint de sincronização
- **ENTÃO** o sistema SHALL processar a sincronização normalmente

### Requirement: Configurações devem ser do tipo booleano

Cada configuração de empresa SHALL possuir um campo `isActive` do tipo booleano que indica se está ativa ou inativa para uma empresa específica.

#### Scenario: Configuração ativa

- **WHEN** uma configuração possui `isActive` como `true` para uma empresa
- **ENTÃO** o comportamento associado a essa configuração SHALL estar habilitado para essa empresa

#### Scenario: Configuração inativa

- **WHEN** uma configuração possui `isActive` como `false` para uma empresa
- **ENTÃO** o comportamento associado a essa configuração SHALL estar desabilitado para essa empresa
