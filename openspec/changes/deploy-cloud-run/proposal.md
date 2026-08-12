## Why

A API ERP hoje só roda localmente, com PostgreSQL em container Docker e configurações hardcoded para desenvolvimento (CORS localhost, `synchronize: true` no TypeORM). O banco Neon já está provisionado e o frontend está sendo deployado no Vercel — falta a API estar no ar para a aplicação funcionar em produção. O Cloud Run com request-based pricing é a escolha certa porque escala a zero quando ocioso, alinhando o custo ao uso real.

## What Changes

- Criação de `Dockerfile` multi-stage para build da aplicação NestJS e imagem de produção enxuta
- Ajuste do CORS para aceitar origins via variável de ambiente `CORS_ORIGINS`, mantendo os localhost como fallback
- Ajuste do TypeORM para usar `synchronize` condicional baseado em `NODE_ENV` (desligado em produção, migrations manuais)
- Inclusão de `PGSSLMODE=require` no db.module.ts para conexão segura com Neon (opcional via env var)
- Criação de `Makefile` com targets para build, push, deploy, secrets e migrations
- Documentação (`docs/deploy-cloud-run.md`) explicando o processo de deploy, secrets, e CI/CD
- Arquivo `.gcloudignore` para evitar upload de arquivos desnecessários no Cloud Build

## Capabilities

### New Capabilities

- `cloud-run-deployment`: Containerização da API via Dockerfile multi-stage, Makefile com targets de build/deploy para Cloud Run, configuração de `gcloud run deploy` com flags de request-based pricing (max-instances, concurrency, cpu-throttling)
- `production-configuration`: CORS dinâmico via env var, TypeORM `synchronize` condicional por ambiente, suporte a SSL para PostgreSQL (Neon), health check endpoint para Cloud Run

### Modified Capabilities

Nenhuma — não existem specs de deployment ou configuração de produção hoje.

## Impact

- `src/main.ts`: CORS origins passam a ler `CORS_ORIGINS` env var, mantendo localhost como fallback
- `src/db/db.module.ts`: `synchronize` vira condicional (`NODE_ENV !== 'production'`), SSL config opcional via env
- `src/health/`: Novo módulo de health check (`/healthz`) para Cloud Run liveness probe
- `package.json`: Novo script `start:prod` já existe, pode ser complementado com `prestart:prod` para rodar migrations
- `docker-compose.yml`: Mantido apenas para desenvolvimento local (banco), sem alterações
- Novos arquivos: `Dockerfile`, `.dockerignore`, `.gcloudignore`, `Makefile`, `docs/deploy-cloud-run.md`
