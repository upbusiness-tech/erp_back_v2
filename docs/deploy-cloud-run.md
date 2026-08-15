# Deploy da API no Google Cloud Run

## Pré-requisitos

1. **Google Cloud SDK** instalado e autenticado:

   ```bash
   gcloud auth login
   gcloud config set project <PROJECT_ID>
   ```

2. **Docker** instalado e rodando

3. **APIs habilitadas no GCP:**
   - Cloud Run API
   - Artifact Registry API
   - Cloud Build API (opcional, para deploy via Cloud Build)

   ```bash
   gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com
   ```

4. **Artifact Registry** configurado:

   ```bash
   gcloud artifacts repositories create erp-api \
     --repository-format=docker \
     --location=us-east4
   ```

5. **Banco Neon** configurado e acessível (já deve estar)

## Variáveis de Ambiente

### Produção (Cloud Run)

Estas variáveis precisam ser configuradas no serviço Cloud Run:

| Variável | Descrição | Exemplo |
|---|---|---|
| `NODE_ENV` | Sempre `production` | `production` |
| `DB_HOST` | Host do Neon | `ep-xxx-pooler.sa-east-1.aws.neon.tech` |
| `DB_PORT` | Porta do Neon | `5432` |
| `DB_USERNAME` | Usuario do Neon | `neondb_owner` |
| `DB_PASSWORD` | Senha do Neon | `npg_xxx` |
| `DB_NAME` | Nome do banco | `neondb` |
| `DB_SSL` | Habilitar SSL | `true` |
| `JWT_COMPANY_SECRET` | Secret JWT company | `seu-secret` |
| `JWT_EMPLOYEE_SECRET` | Secret JWT employee | `seu-secret` |
| `JWT_ADMIN_SECRET` | Secret JWT admin | `seu-secret` |
| `JWT_EXPIRATION_TIME` | Tempo de expiração JWT | `3000` |
| `CORS_ORIGINS` | URL do frontend Vercel | `https://erp-front-v2.vercel.app` |
| `TZ` | Timezone do sistema operacional | `America/Sao_Paulo` |
| `PGTZ` | Timezone da sessão PostgreSQL | `America/Sao_Paulo` |
| `RUN_MIGRATIONS` | Rodar migrations no startup | `true` (opcional) |

### Desenvolvimento (.env)

O `.env` local continua funcionando normalmente. As configurações de produção são injetadas apenas no Cloud Run.

**Importante:** Para manter consistência de datas entre local e Cloud Run, configure também no `.env` local:

```
TZ=America/Sao_Paulo
PGTZ=America/Sao_Paulo
```

E no `docker-compose.yml`, adicione as mesmas variáveis no serviço `postgres`:

```yaml
environment:
  - POSTGRES_DB=erp-db
  - POSTGRES_USER=postgres
  - POSTGRES_PASSWORD=postgres
  - TZ=America/Sao_Paulo
  - PGTZ=America/Sao_Paulo
```

Depois de alterar, reinicie o container local:

```bash
docker compose down
docker compose up -d
```

## Makefile - Comandos

| Comando | Descrição |
|---|---|
| `make build` | Constrói a imagem Docker e tageia para Artifact Registry |
| `make push` | Envia a imagem para Artifact Registry |
| `make deploy` | Faz deploy no Cloud Run com configurações de produção |
| `make deploy-all` | Executa build → push → deploy em sequência |
| `make secrets` | Mostra o comando para configurar env vars no Cloud Run |
| `make migrate` | Mostra instruções para rodar migrations |
| `make rollback` | Reverte para a revisão anterior do Cloud Run |

### Configuração Inicial

1. Edite o `Makefile` e ajuste as variáveis:

   ```makefile
   PROJECT_ID ?= meu-projeto-gcp
   REGION ?= us-east4
   SERVICE_NAME ?= erp-api
   ```

2. Construa a imagem:

   ```bash
   make build
   ```

3. Envie para Artifact Registry:

   ```bash
   make push
   ```

4. Faça o deploy inicial:

   ```bash
   make deploy
   ```

5. Configure as variáveis de ambiente:

   ```bash
   make secrets
   ```

   Copie o comando exibido, preencha com seus valores e execute.

6. Verifique o deploy:

   ```bash
   curl https://erp-api-xxxxx-ua.a.run.app/health
   ```

   Deve retornar `{ "status": "ok", "database": "connected" }`.

### Deploy Contínuo

Após a configuração inicial, use:

```bash
make deploy-all
```

## Ordem de Deploy (Backend + Frontend no Vercel)

```
┌──────────────────────────────────────────────────────────────────┐
│  1. Deploy Backend (Cloud Run)                                    │
│     make deploy-all  # CORS ja configurado para erp-front-v2     │
│     make secrets     # configurar DB e JWT secrets               │
│     curl <url>/health  # verificar                              │
│                                                                   │
│  2. Deploy Frontend (Vercel)                                      │
│     Configurar VITE_API_URL com a URL do Cloud Run               │
│     Fazer deploy normalmente no Vercel                            │
└──────────────────────────────────────────────────────────────────┘
```

> **Por que backend primeiro?** O frontend precisa da URL da API para funcionar. O CORS já está configurado no deploy (`CORS_ORIGINS=https://erp-front-v2.vercel.app`).

## Configurar Frontend no Vercel

1. No código do frontend, use a env var `VITE_API_URL` ou `NEXT_PUBLIC_API_URL`:

   ```
   VITE_API_URL=https://erp-api-xxxxx-ua.a.run.app
   ```

2. No dashboard do Vercel, vá em Settings → Environment Variables e adicione a variável.

3. Faça o deploy. O frontend agora aponta para a API no Cloud Run.

## Troubleshooting

### Cold start lento

O primeiro request após inatividade pode demorar 3-8s. Isso é normal — o Cloud Run escala a zero. Se a latência for inaceitável, aumente `min-instances`:

```bash
gcloud run services update erp-api --region us-east4 --min-instances 1
```

> Cuidado: `min-instances: 1` mantém uma instância sempre ligada (~$5-10/mês).

### Erro de CORS no frontend

Verifique:
1. `CORS_ORIGINS` está configurado com a URL exata do frontend
2. A URL inclui `https://`
3. Não tem `/` no final da URL

### Erro de conexão com banco

Verifique:
1. `DB_SSL=true` está configurado
2. `DB_HOST` é o host com pooler do Neon (termina em `-pooler`)
3. As credenciais estão corretas no `make secrets`

### Datas/horários diferentes entre local e Cloud Run

As colunas `createdAt`, `updatedAt` e `deletedAt` são `timestamp without time zone` no PostgreSQL — ou seja, o banco armazena o horário literalmente, sem fuso. A interpretação depende do timezone da conexão.

Para manter consistência, **todos os ambientes devem usar o mesmo timezone** (`America/Sao_Paulo` neste caso):

- **Cloud Run**: env vars `TZ=America/Sao_Paulo` e `PGTZ=America/Sao_Paulo` (já configurado)
- **API local**: adicione no `.env`:
  ```
  TZ=America/Sao_Paulo
  PGTZ=America/Sao_Paulo
  ```
- **PostgreSQL local**: adicione no `docker-compose.yml`:
  ```yaml
  environment:
    - TZ=America/Sao_Paulo
    - PGTZ=America/Sao_Paulo
  ```
  Depois reinicie o container:
  ```bash
  docker compose down && docker compose up -d
  ```

Se os dados já existentes no banco estiverem com fuso errado, eles continuarão deslocados. A configuração acima garante consistência para **novos registros e leituras futuras**.

### Erro `synchronize: false` / tabelas não encontradas

Em produção o `synchronize` fica desligado. Execute as migrations manualmente:

```bash
npm run migration:run
```

## Rollback

O Cloud Run mantém histórico de revisões. Para reverter:

```bash
make rollback
```

Isso direciona 0% do tráfego para a revisão mais recente e 100% para a anterior.

## Custos Estimados

| Recurso | Custo |
|---|---|
| Cloud Run (request-based) | $0 por idle, ~$0.000024/vCPU-segundo, ~$0.40/milhão de requests |
| Neon (free tier) | $0 (0.5 CPU, 1GB RAM, 3GB storage) |
| Artifact Registry | $0 (até 0.5GB storage) |
| **Total estimado** | **~$0-3/mês** com uso baixo/moderado |
