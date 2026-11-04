# Ambiente de producao (projeto dedicado).
PROJECT_ID := erp-v2-prod
SERVICE := erp-api
REGION := southamerica-east1
REGISTRY := $(REGION)-docker.pkg.dev/$(PROJECT_ID)/$(SERVICE)

MIN_INSTANCES := 1
MAX_INSTANCES := 5
TIMEOUT := 300s
MEMORY := 512Mi
CPU := 1
CONCURRENCY := 80

SA_NAME := erp-api-run
SA_EMAIL := $(SA_NAME)@$(PROJECT_ID).iam.gserviceaccount.com
SERVICE_ACCOUNT := $(SA_EMAIL)

LABELS := env=production,app=erp-api
