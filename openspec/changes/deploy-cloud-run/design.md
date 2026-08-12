## Context

A API ERP é uma aplicação NestJS com TypeORM conectando a PostgreSQL. Hoje roda apenas localmente (`npm run start:dev`). O banco Neon já está provisionado e acessível. O frontend será deployado no Vercel. Não existe Dockerfile, Makefile, pipeline de CI/CD, nem configuração de produção.

O Cloud Run foi escolhido por oferecer request-based pricing (escala a zero, cobra por requisição + vCPU/segundo durante processamento). Ver proposta para motivação completa.

### Restrições técnicas atuais
- `main.ts`: CORS hardcoded para localhost
- `db.module.ts`: `synchronize: true` fixo, sem suporte a SSL
- Porta padrão: 3000 (Cloud Run espera `PORT` env var)
- Autenticação JWT com 3 secrets diferentes (company, employee, admin)
- `.env` versionado (?) com secrets locais — precisa ser tratado

## Goals / Non-Goals

**Goals:**
- Containerizar a API com Dockerfile multi-stage otimizado para Cloud Run
- Automatizar build, push e deploy com Makefile
- Tornar CORS e TypeORM configuráveis por ambiente sem quebrar dev local
- Garantir conexão SSL com Neon em produção
- Health check endpoint para liveness probe do Cloud Run
- Documentar o processo completo de deploy

**Non-Goals:**
- CI/CD automatizado (Cloud Build / GitHub Actions) — fica para iteração futura, mas o Makefile é desenhado para ser facilmente usado por qualquer pipeline
- Migrations automáticas no startup — serão executadas manualmente ou via `npm run migration:run` antes do deploy
- Cloud SQL ou outro provedor de banco — Neon já está definido
- Infraestrutura como código (Terraform, Pulumi) — o escopo é só o Makefile + Dockerfile
- Custom domain com HTTPS — usa o domínio automático do Cloud Run (`*.a.run.app`)

## Decisions

### Decisão 1: Dockerfile multi-stage com Node Alpine

**Escolha**: Dois estágios — `build` (instala todas as dependências, compila TypeScript com `nest build`) e `production` (copia `dist/`, `node_modules` de produção, runtime Alpine).

**Alternativas consideradas:**
- Distroless (Google): Mais seguro, mas difícil de debugar e incompatível com algumas libs nativas (bcrypt)
- Node slim: Mais leve que Alpine, mas Alpine é padrão no ecossistema NestJS

**Rationale**: Alpine é leve (~50MB a menos que slim), bem suportado, e o bcrypt compila sem problemas. Multi-stage reduz a imagem final em ~60%.

### Decisão 2: Makefile sobre shell scripts soltos

**Escolha**: Makefile centralizado com targets nomeados (`build`, `push`, `deploy`, `deploy-all`, `secrets`).

**Alternativas consideradas:**
- Shell scripts (`deploy.sh`): Menos padronizado, sem ajuda de autocomplete
- npm scripts: Bom para tarefas simples, ruim para pipelines com múltiplos passos dependentes
- Taskfile (go-task): Mais moderno, mas dependência extra

**Rationale**: Makefile é zero dependência (vem em qualquer sistema), tem targets com dependências, e é familiar para quem faz deploy. Os comandos `gcloud` são invocados diretamente.

### Decisão 3: CORS via env var com fallback para localhost

**Escolha**: `CORS_ORIGINS` como string separada por vírgula. Se definida, faz merge com os localhost fixos. Se ausente, mantém comportamento atual.

**Alternativas consideradas:**
- Substituir totalmente os localhost pela env var: Quebraria dev local se a env var não for definida
- CORS wildcard (`*`): Funcionaria, mas inseguro e incompatível com `credentials: true`
- Arquivo de config por ambiente: Complexidade desnecessária, NestJS já usa `@nestjs/config`

**Rationale**: Merge de origins permite que o desenvolvedor continue rodando localmente sem configurar nada, enquanto produção recebe a URL do Vercel via env var no Cloud Run.

### Decisão 4: TypeORM synchronize condicional

**Escolha**: `synchronize: process.env.NODE_ENV !== 'production'`. Em produção, usar migrations manuais (`npm run migration:run`).

**Alternativas consideradas:**
- Variável dedicada `DB_SYNCHRONIZE`: Mais granular, mas redundante — `NODE_ENV` já é o padrão para comportamento condicional
- Deixar `synchronize: true` sempre: Risco de perda de dados em produção

**Rationale**: `NODE_ENV` é o padrão universal para distinguir ambientes. Não faz sentido ter `synchronize: true` em produção com dados reais.

### Decisão 5: Health check com verificação de banco

**Escolha**: Endpoint `GET /healthz` que faz um `SELECT 1` no banco e retorna 200/503.

**Alternativas consideradas:**
- Health check sem banco (só "estou vivo"): Cloud Run aceitaria requisições mesmo com banco offline → erros 500 nos usuários
- Terminus (`@nestjs/terminus`): Mais completo, mas adiciona dependência para um endpoint simples

**Rationale**: Cloud Run precisa saber se a instância está realmente funcional. Sem verificação de banco, o load balancer continuaria roteando tráfego para instâncias quebradas.

## Risks / Trade-offs

**[Risco] Cold start no primeiro request** → Cloud Run escala a zero, então o primeiro request após inatividade sofre latência de inicialização do container (3-8s para NestJS + TypeORM conectar). Mitigação: configurar `min-instances: 0` (padrão, custo zero quando ocioso) mas aceitar o cold start. Se a latência for inaceitável, pode-se subir `min-instances: 1` depois (custa ~$5-10/mês).

**[Risco] Secrets no .env local vs Cloud Run** → Os secrets (JWT secrets, DB password) hoje estão no `.env` (local) e precisam ser injetados como env vars no Cloud Run. Mitigação: target `make secrets` no Makefile que lê do `.env` e aplica com `gcloud run services update --set-env-vars`. Para produção real, migrar para Secret Manager posteriormente.

**[Risco] Migrations do TypeORM não são automáticas** → Se houver migrations pendentes no deploy, a API quebra. Mitigação: documentar o passo de rodar `npm run migration:run` antes ou durante o deploy. Adicionar script `prestart:prod` que roda migrations automaticamente se `RUN_MIGRATIONS=true`.

**[Trade-off] Imagem inclui TypeScript source** → O multi-stage copia só `dist/` e `node_modules`, mas o TypeORM precisa dos paths de migration. Por enquanto migrations estão em `.ts` — em produção idealmente seriam compiladas para `.js`. Mitigação: no curto prazo, rodar migrations localmente antes do deploy. Migração para migrations compiladas fica como melhoria futura.

## Migration Plan

### Deploy inicial

1. Build da imagem Docker: `make build`
2. Push para Artifact Registry: `make push`
3. Rodar migrations no banco Neon: `make migrate`
4. Deploy no Cloud Run: `make deploy`
5. Configurar secrets no Cloud Run: `make secrets`
6. Verificar health check: `curl https://erp-api-xxxxx.a.run.app/healthz`
7. Atualizar frontend no Vercel com a URL do Cloud Run

### Rollback

- Cloud Run mantém revisões anteriores automaticamente
- `gcloud run services update-traffic --to-revisions <revision> --to-latest=0`
- Ou via Makefile: `make rollback`

### Deploy contínuo (após primeiro deploy)

1. `make deploy-all` (build + push + deploy em um comando)

## Open Questions

Nenhuma — todas as decisões de design foram resolvidas durante a exploração.
