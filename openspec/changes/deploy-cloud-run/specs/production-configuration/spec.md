## Purpose

Garantir que a API funcione corretamente em ambientes de produção (Cloud Run + Neon) com configurações seguras e dinâmicas, sem depender de valores hardcoded.

## ADDED Requirements

### Requirement: CORS origins configuráveis via variável de ambiente

O sistema DEVE aceitar origins CORS via variável de ambiente `CORS_ORIGINS` (lista separada por vírgula) e combiná-las com os origins de desenvolvimento local como fallback.

#### Scenario: CORS_ORIGINS definida com valor de produção
- **WHEN** a variável `CORS_ORIGINS=https://meu-app.vercel.app` está definida
- **THEN** o CORS aceita requests tanto de `https://meu-app.vercel.app` quanto dos origins locais (localhost:4200, localhost:3000, localhost:5173, localhost:8080)

#### Scenario: CORS_ORIGINS ausente (ambiente local)
- **WHEN** a variável `CORS_ORIGINS` não está definida
- **THEN** o CORS aceita apenas os origins locais padrão

#### Scenario: CORS_ORIGINS com múltiplos valores
- **WHEN** `CORS_ORIGINS=https://app.vercel.app,https://admin.vercel.app` está definida
- **THEN** ambos os domínios são aceitos pelo CORS, além dos origins locais

### Requirement: TypeORM synchronize condicional por ambiente

O sistema DEVE desabilitar `synchronize: true` do TypeORM quando `NODE_ENV=production`, prevenindo alterações automáticas de schema em produção.

#### Scenario: Ambiente de produção desabilita synchronize
- **WHEN** `NODE_ENV=production` está definido
- **THEN** TypeORM inicia com `synchronize: false`

#### Scenario: Ambiente de desenvolvimento mantém synchronize
- **WHEN** `NODE_ENV` não é `production` (ou não está definido)
- **THEN** TypeORM inicia com `synchronize: true`

### Requirement: Suporte a SSL para conexão PostgreSQL (Neon)

O sistema DEVE suportar conexão SSL com PostgreSQL quando a variável `DB_SSL=true` estiver definida, permitindo conexão segura com Neon.

#### Scenario: Conexão SSL ativada para Neon
- **WHEN** `DB_SSL=true` está definido
- **THEN** a conexão TypeORM com PostgreSQL usa `ssl: { rejectUnauthorized: false }`

#### Scenario: Conexão sem SSL para desenvolvimento local
- **WHEN** `DB_SSL` não está definido ou é `false`
- **THEN** a conexão TypeORM com PostgreSQL não configura SSL

### Requirement: Health check endpoint

O sistema DEVE expor um endpoint `GET /healthz` que retorna o status da aplicação, incluindo conectividade com o banco de dados.

#### Scenario: Aplicação e banco estão saudáveis
- **WHEN** uma requisição GET é feita para `/healthz`
- **THEN** o sistema retorna HTTP 200 com body `{ "status": "ok", "database": "connected" }`

#### Scenario: Banco de dados inacessível
- **WHEN** uma requisição GET é feita para `/healthz` e o banco não responde
- **THEN** o sistema retorna HTTP 503 com body indicando falha na conexão com banco
