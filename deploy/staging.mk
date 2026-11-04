# Ambiente de staging.
# O ID do projeto e legado e imutavel: ele hospeda staging desde a separacao
# dos ambientes. O display name no console e "ERP v2 Staging".
PROJECT_ID := erp-v2-production
SERVICE := erp-api
REGION := southamerica-east1
REGISTRY := $(REGION)-docker.pkg.dev/$(PROJECT_ID)/$(SERVICE)

MIN_INSTANCES := 0
MAX_INSTANCES := 3
TIMEOUT := 60s
MEMORY := 512Mi
CPU := 1
CONCURRENCY := 80

# Staging mantem a service account padrao do servico existente.
SERVICE_ACCOUNT :=
SA_NAME :=
SA_EMAIL :=

LABELS := env=staging,app=erp-api
