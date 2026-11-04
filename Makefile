SHELL := /bin/bash
.ONESHELL:
.DEFAULT_GOAL := help

# Ambiente alvo. Default seguro: staging.
ENV ?= staging
SUPPORTED_ENVS := staging production

ifeq ($(filter $(ENV),$(SUPPORTED_ENVS)),)
$(error Ambiente invalido: '$(ENV)'. Use ENV=staging ou ENV=production.)
endif

include deploy/$(ENV).mk

ENV_FILE ?= .env.$(ENV)
TAG ?= $(shell git rev-parse --short HEAD 2>/dev/null || echo dev)
IMAGE := $(REGISTRY)/$(SERVICE)
IMAGE_TAG := $(IMAGE):$(TAG)
TMP_DIR := .tmp
ENV_VARS_FILE := $(TMP_DIR)/env-vars.$(ENV).yaml

REQUIRED_KEYS := DB_HOST DB_PORT DB_USERNAME DB_PASSWORD DB_NAME \
	JWT_COMPANY_SECRET JWT_EMPLOYEE_SECRET JWT_ADMIN_SECRET JWT_EXPIRATION_TIME \
	CORS_ORIGINS FIREBASE_SERVICE_ACCOUNT NODE_ENV

.PHONY: help config-check provision build push deploy deploy-all env smoke rollback status url logs migrate db-baseline

help:
	@echo "ERP API - deploy multi-ambiente"
	@echo ""
	@echo "Ambientes:"
	@echo "  ENV=staging     projeto erp-v2-production | servico erp-api | CORS do frontend de staging"
	@echo "  ENV=production  projeto erp-v2-prod       | servico erp-api | CORS do frontend de producao"
	@echo "  (default: ENV=staging)"
	@echo ""
	@echo "Comandos:"
	@echo "  make help                                  Lista os comandos"
	@echo "  make config-check ENV=...                  Valida arquivo de env, gcloud, projeto e CORS"
	@echo "  make provision ENV=...                     Cria APIs, registry e service account (idempotente)"
	@echo "  make build ENV=...                         Build da imagem com tag do commit"
	@echo "  make push ENV=...                          Publica a imagem no Artifact Registry"
	@echo "  make deploy ENV=... [CONFIRM=production]   Deploy atomico em uma revisao"
	@echo "  make deploy-all ENV=... [CONFIRM=production]  config-check + build + push + deploy + smoke"
	@echo "  make env ENV=...                           Atualiza variaveis sem rebuild"
	@echo "  make smoke ENV=...                         Verifica /health"
	@echo "  make rollback ENV=...                      Volta o trafego para a revisao anterior"
	@echo "  make status|url|logs ENV=...               Inspeciona o servico"
	@echo "  make db-baseline ENV=... CONFIRM=...       Baseline unico do banco (migrations, indices, permissoes)"
	@echo "  make migrate ENV=... [CONFIRM=production]  Executa migrations contra o banco do ambiente"
	@echo ""
	@echo "Arquivos de ambiente: .env (dev local), .env.staging, .env.production, .env.example (template)"
	@echo "Producao exige CONFIRM=production em deploy, deploy-all e migrate."

config-check:
	@set -euo pipefail
	echo "==> config-check ENV=$(ENV) | projeto=$(PROJECT_ID) | servico=$(SERVICE)"
	if [ ! -f "$(ENV_FILE)" ]; then
	  echo "ERRO: arquivo $(ENV_FILE) nao encontrado. Crie a partir de .env.example."
	  exit 1
	fi
	missing=0
	for key in $(REQUIRED_KEYS); do
	  if ! value=$$(deploy/scripts/env-get.sh "$(ENV_FILE)" "$$key") || [ -z "$$value" ]; then
	    echo "ERRO: chave obrigatoria ausente ou vazia: $$key"
	    missing=1
	  fi
	done
	if [ "$$missing" -ne 0 ]; then
	  echo "ERRO: corrija $(ENV_FILE) antes de continuar."
	  exit 1
	fi
	account=$$(gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null | head -n1 || true)
	if [ -z "$$account" ]; then
	  echo "ERRO: nenhuma conta gcloud ativa. Rode: gcloud auth login"
	  exit 1
	fi
	if ! gcloud projects describe "$(PROJECT_ID)" --format="value(projectId)" >/dev/null 2>&1; then
	  echo "ERRO: projeto $(PROJECT_ID) inacessivel para $$account (ENV=$(ENV))."
	  exit 1
	fi
	mkdir -p "$(TMP_DIR)"
	chmod 700 "$(TMP_DIR)"
	python3 deploy/scripts/env-to-yaml.py "$(ENV_FILE)" > "$(ENV_VARS_FILE)"
	chmod 600 "$(ENV_VARS_FILE)"
	echo "OK: configuracao valida. Alvo: $(PROJECT_ID)/$(REGION)/$(SERVICE) imagem=$(TAG)"

provision:
	@set -euo pipefail
	echo "==> provision ENV=$(ENV) no projeto $(PROJECT_ID)"
	gcloud services enable run.googleapis.com artifactregistry.googleapis.com --project "$(PROJECT_ID)"
	if gcloud artifacts repositories describe "$(SERVICE)" --project "$(PROJECT_ID)" --location "$(REGION)" >/dev/null 2>&1; then
	  echo "OK: registry $(SERVICE) ja existe em $(REGION)."
	else
	  gcloud artifacts repositories create "$(SERVICE)" \
	    --project "$(PROJECT_ID)" \
	    --repository-format=docker \
	    --location "$(REGION)" \
	    --description "Imagens da API ERP"
	fi
	if [ -n "$(SA_NAME)" ]; then
	  if gcloud iam service-accounts describe "$(SA_EMAIL)" --project "$(PROJECT_ID)" >/dev/null 2>&1; then
	    echo "OK: service account $(SA_EMAIL) ja existe."
	  else
	    gcloud iam service-accounts create "$(SA_NAME)" \
	      --project "$(PROJECT_ID)" \
	      --display-name "ERP API Cloud Run"
	  fi
	fi
	echo "Provisionamento de $(ENV) concluido."

build:
	@set -euo pipefail
	echo "==> build $(IMAGE_TAG)"
	docker build -t "$(IMAGE_TAG)" -t "$(IMAGE):latest" .

push:
	@set -euo pipefail
	echo "==> push $(IMAGE_TAG)"
	gcloud auth configure-docker "$(REGION)-docker.pkg.dev" --quiet
	docker push "$(IMAGE_TAG)"
	docker push "$(IMAGE):latest"

deploy: config-check
	@set -euo pipefail
	if [ "$(ENV)" = "production" ] && [ "$(CONFIRM)" != "production" ]; then
	  echo "ERRO: deploy de producao exige CONFIRM=production."
	  exit 1
	fi
	trap 'rm -f "$(ENV_VARS_FILE)"' EXIT
	args=(deploy "$(SERVICE)" --project "$(PROJECT_ID)" --region "$(REGION)" --platform managed --image "$(IMAGE_TAG)" --env-vars-file "$(ENV_VARS_FILE)" --allow-unauthenticated --port 3000 --cpu-throttling --min-instances "$(MIN_INSTANCES)" --max-instances "$(MAX_INSTANCES)" --concurrency "$(CONCURRENCY)" --memory "$(MEMORY)" --cpu "$(CPU)" --timeout "$(TIMEOUT)" --labels "$(LABELS)")
	if [ -n "$(SERVICE_ACCOUNT)" ]; then
	  args+=(--service-account "$(SERVICE_ACCOUNT)")
	fi
	echo "==> deploy $(SERVICE) em $(PROJECT_ID) ($(REGION)) imagem=$(TAG)"
	gcloud run "$${args[@]}"

deploy-all:
	@set -euo pipefail
	if [ "$(ENV)" = "production" ] && [ "$(CONFIRM)" != "production" ]; then
	  echo "ERRO: deploy de producao exige CONFIRM=production."
	  exit 1
	fi
	$(MAKE) --no-print-directory config-check ENV="$(ENV)"
	$(MAKE) --no-print-directory build ENV="$(ENV)" TAG="$(TAG)"
	$(MAKE) --no-print-directory push ENV="$(ENV)" TAG="$(TAG)"
	$(MAKE) --no-print-directory deploy ENV="$(ENV)" CONFIRM="$(CONFIRM)"
	$(MAKE) --no-print-directory smoke ENV="$(ENV)"

env: config-check
	@set -euo pipefail
	trap 'rm -f "$(ENV_VARS_FILE)"' EXIT
	echo "==> atualizando variaveis de $(SERVICE) em $(PROJECT_ID)"
	gcloud run services update "$(SERVICE)" \
	  --project "$(PROJECT_ID)" \
	  --region "$(REGION)" \
	  --env-vars-file "$(ENV_VARS_FILE)"

smoke:
	@set -euo pipefail
	url=$$(gcloud run services describe "$(SERVICE)" --project "$(PROJECT_ID)" --region "$(REGION)" --format="value(status.url)")
	if [ -z "$$url" ]; then
	  echo "ERRO: servico $(SERVICE) sem URL em $(PROJECT_ID)."
	  exit 1
	fi
	echo "==> smoke $${url}/health"
	body=""
	for attempt in $$(seq 1 30); do
	  if body=$$(curl -fsS --max-time 10 "$$url/health" 2>/dev/null) && echo "$$body" | grep -q '"database":"connected"'; then
	    echo "OK: $$body"
	    exit 0
	  fi
	  sleep 5
	done
	echo "ERRO: health check falhou apos 30 tentativas."
	echo "Ultima resposta: $${body:-<vazia>}"
	exit 1

rollback:
	@set -euo pipefail
	current=$$(gcloud run services describe "$(SERVICE)" --project "$(PROJECT_ID)" --region "$(REGION)" --format="value(status.latestReadyRevisionName)")
	previous=$$(gcloud run revisions list --service "$(SERVICE)" --project "$(PROJECT_ID)" --region "$(REGION)" --sort-by="~creationTimestamp" --format="value(metadata.name)" | grep -v "^$${current}$$" | head -n1 || true)
	if [ -z "$$previous" ]; then
	  echo "ERRO: nenhuma revisao anterior encontrada para $(SERVICE) em $(PROJECT_ID)."
	  exit 1
	fi
	echo "==> rollback: $$current -> $$previous"
	gcloud run services update-traffic "$(SERVICE)" \
	  --project "$(PROJECT_ID)" \
	  --region "$(REGION)" \
	  --to-revisions "$${previous}=100"

status:
	@set -euo pipefail
	gcloud run services describe "$(SERVICE)" --project "$(PROJECT_ID)" --region "$(REGION)" \
	  --format="yaml(status.url,status.latestReadyRevisionName,status.traffic)"

url:
	@gcloud run services describe "$(SERVICE)" --project "$(PROJECT_ID)" --region "$(REGION)" --format="value(status.url)"

logs:
	@set -euo pipefail
	gcloud run services logs read "$(SERVICE)" --project "$(PROJECT_ID)" --region "$(REGION)" --limit 200

migrate:
	@set -euo pipefail
	trap 'rm -f "$(ENV_VARS_FILE)"' EXIT
	$(MAKE) --no-print-directory config-check ENV="$(ENV)"
	if [ "$(ENV)" = "production" ] && [ "$(CONFIRM)" != "production" ]; then
	  echo "ERRO: migrate de producao exige CONFIRM=production."
	  exit 1
	fi
	if ! command -v psql >/dev/null 2>&1; then
	  echo "ERRO: psql nao encontrado. Instale o cliente PostgreSQL."
	  exit 1
	fi
	export PGHOST=$$(deploy/scripts/env-get.sh "$(ENV_FILE)" DB_HOST)
	export PGPORT=$$(deploy/scripts/env-get.sh "$(ENV_FILE)" DB_PORT)
	export PGUSER=$$(deploy/scripts/env-get.sh "$(ENV_FILE)" DB_USERNAME)
	export PGPASSWORD=$$(deploy/scripts/env-get.sh "$(ENV_FILE)" DB_PASSWORD)
	export PGDATABASE=$$(deploy/scripts/env-get.sh "$(ENV_FILE)" DB_NAME)
	ssl=$$(deploy/scripts/env-get.sh "$(ENV_FILE)" DB_SSL || echo false)
	if [ "$$ssl" = "true" ]; then export PGSSLMODE=require; fi
	exists=$$(psql -X -tAc "SELECT to_regclass('public.migrations')")
	if [ "$$exists" != "migrations" ]; then
	  echo "ERRO: tabela migrations ausente em $(ENV). Rode primeiro: make db-baseline ENV=$(ENV) CONFIRM=$(ENV)"
	  exit 1
	fi
	echo "==> migrate ENV=$(ENV) usando $(ENV_FILE)"
	DOTENV_CONFIG_PATH="$(ENV_FILE)" npm run migration:run

db-baseline:
	@set -euo pipefail
	if [ ! -f "$(ENV_FILE)" ]; then
	  echo "ERRO: arquivo $(ENV_FILE) nao encontrado."
	  exit 1
	fi
	if [ "$(CONFIRM)" != "$(ENV)" ]; then
	  echo "ERRO: db-baseline exige CONFIRM=$(ENV)."
	  exit 1
	fi
	if ! command -v psql >/dev/null 2>&1; then
	  echo "ERRO: psql nao encontrado. Instale o cliente PostgreSQL."
	  exit 1
	fi
	echo "AVISO: crie um branch/snapshot do Neon de $(ENV) antes de continuar."
	echo "AVISO: este comando escreve no banco de $(ENV) ($(PROJECT_ID) via $(ENV_FILE))."
	export PGHOST=$$(deploy/scripts/env-get.sh "$(ENV_FILE)" DB_HOST)
	export PGPORT=$$(deploy/scripts/env-get.sh "$(ENV_FILE)" DB_PORT)
	export PGUSER=$$(deploy/scripts/env-get.sh "$(ENV_FILE)" DB_USERNAME)
	export PGPASSWORD=$$(deploy/scripts/env-get.sh "$(ENV_FILE)" DB_PASSWORD)
	export PGDATABASE=$$(deploy/scripts/env-get.sh "$(ENV_FILE)" DB_NAME)
	ssl=$$(deploy/scripts/env-get.sh "$(ENV_FILE)" DB_SSL || echo false)
	if [ "$$ssl" = "true" ]; then export PGSSLMODE=require; fi
	echo "==> aplicando baseline em $(ENV)"
	for file in deploy/sql/baseline-migrations.sql deploy/sql/baseline-indexes.sql deploy/sql/baseline-permissions.sql; do
	  echo "-- $$file"
	  psql -X -v ON_ERROR_STOP=1 -f "$$file"
	done
	echo "Baseline concluido. Valide com as queries do runbook."
