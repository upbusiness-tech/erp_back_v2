## 1. Configuracao de Producao (Codigo)

- [x] 1.1 Ajustar `src/main.ts` para ler CORS origins da env var `CORS_ORIGINS` (split por virgula), fazendo merge com os localhost padrao
- [x] 1.2 Ajustar `src/db/db.module.ts` para usar `synchronize: process.env.NODE_ENV !== 'production'`
- [x] 1.3 Adicionar suporte a `DB_SSL=true` no `db.module.ts` para conexao SSL com Neon (passar `ssl: { rejectUnauthorized: false }` para o TypeORM quando a env var estiver definida)
- [x] 1.4 Criar `src/health/health.module.ts` e `src/health/health.controller.ts` com endpoint `GET /healthz` que verifica conexao com banco via TypeORM (`SELECT 1`)
- [x] 1.5 Registrar `HealthModule` no `AppModule` (importar no `app.module.ts`)

## 2. Containerizacao Docker

- [x] 2.1 Criar `Dockerfile` multi-stage: estagio `build` (node:24-alpine, instala todas deps, roda `nest build`), estagio `production` (node:24-alpine, copia `dist/`, `package.json`, `package-lock.json`, instala so `--production`)
- [x] 2.2 Criar `.dockerignore` excluindo `node_modules`, `dist`, `.git`, `test`, `docker-compose.yml`, `.env`, `openspec`, `v2`, `*.md`
- [x] 2.3 Adicionar script `prestart:prod` no `package.json` que verifica se `RUN_MIGRATIONS=true` e executa `npm run migration:run` antes do `start:prod`

## 3. Automacao com Makefile

- [x] 3.1 Criar `Makefile` com variaveis no topo: `PROJECT_ID`, `REGION`, `SERVICE_NAME`, `IMAGE_NAME`
- [x] 3.2 Target `make build`: `docker build -t ${REGION}-docker.pkg.dev/${PROJECT_ID}/${SERVICE_NAME}/${IMAGE_NAME} .`
- [x] 3.3 Target `make push`: autentica no Artifact Registry (`gcloud auth configure-docker`) e faz `docker push`
- [x] 3.4 Target `make deploy`: `gcloud run deploy ${SERVICE_NAME} --image <imagem> --region ${REGION} --platform managed --allow-unauthenticated --cpu-throttling --max-instances=3 --concurrency=80 --port=3000 --set-env-vars=NODE_ENV=production`
- [x] 3.5 Target `make secrets`: le variaveis sensiveis e aplica com `gcloud run services update --update-env-vars`
- [x] 3.6 Target `make deploy-all`: dependencia de `build` -> `push` -> `deploy`
- [x] 3.7 Criar `.gcloudignore` excluindo arquivos desnecessarios do upload no Cloud Build

## 4. Documentacao

- [x] 4.1 Criar `docs/deploy-cloud-run.md` com: pre-requisitos (gcloud CLI, Docker, projeto GCP criado, APIs habilitadas), explicacao de cada target do Makefile, como configurar secrets, variaveis de ambiente necessarias, ordem de deploy (backend -> frontend), como configurar CORS no frontend Vercel, troubleshooting comum

## 5. Validacao

- [x] 5.1 Testar build local: `docker build -t erp-api . && docker run -p 8080:3000 --env-file .env erp-api`
- [x] 5.2 Testar health check local: `curl http://localhost:8080/healthz`
- [x] 5.3 Testar CORS com env var: subir container com `CORS_ORIGINS=https://test.vercel.app` e verificar headers `Access-Control-Allow-Origin`
- [x] 5.4 Realizar deploy manual no Cloud Run usando `make deploy-all`
- [x] 5.5 Verificar deploy: `curl https://<service-url>/health` e testar um endpoint autenticado
