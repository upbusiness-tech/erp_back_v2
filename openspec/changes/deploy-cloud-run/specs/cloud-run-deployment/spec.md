## Purpose

Prover containerização e deploy automatizado da API NestJS no Google Cloud Run, com custo baseado em requisição (request-based pricing) e documentação do processo.

## ADDED Requirements

### Requirement: Dockerfile multi-stage para build e produção

O sistema DEVE fornecer um Dockerfile que compile a aplicação NestJS em um estágio de build e produza uma imagem de produção enxuta no estágio final, usando Node.js Alpine.

#### Scenario: Build do Dockerfile gera imagem funcional
- **WHEN** o comando `docker build -t erp-api .` é executado
- **THEN** o sistema gera uma imagem Docker com o código compilado em `dist/` e apenas dependências de produção instaladas

#### Scenario: Container inicia e responde na porta configurada
- **WHEN** o container é iniciado com `docker run -p 8080:3000 erp-api`
- **THEN** a API responde a requisições HTTP na porta 3000 interna (mapeada para 8080)

### Requirement: Makefile com targets de build, push e deploy

O sistema DEVE fornecer um Makefile com targets documentados para construir a imagem Docker, enviar ao Artifact Registry do Google Cloud e fazer deploy no Cloud Run.

#### Scenario: Target `make build` constroi a imagem
- **WHEN** `make build` é executado
- **THEN** a imagem Docker é construída com tag incluindo o project-id do GCP e região do registry

#### Scenario: Target `make push` envia imagem ao Artifact Registry
- **WHEN** `make push` é executado após `make build`
- **THEN** a imagem é enviada ao Artifact Registry do projeto GCP configurado

#### Scenario: Target `make deploy` faz deploy no Cloud Run
- **WHEN** `make deploy` é executado
- **THEN** o serviço Cloud Run é atualizado com a nova imagem, configurado com `--no-cpu-throttling` desligado (request-based), max-instances definido, e concurrency apropriado

### Requirement: Documentação do processo de deploy

O sistema DEVE incluir documentação explicando o processo completo de deploy, incluindo pré-requisitos, configuração do GCP, comandos do Makefile, secrets, e CI/CD.

#### Scenario: Desenvolvedor segue a documentação e realiza deploy com sucesso
- **WHEN** um desenvolvedor lê `docs/deploy-cloud-run.md` e segue os passos
- **THEN** ele consegue realizar o deploy manual da API no Cloud Run sem ambiguidades

### Requirement: Deploy sob demanda e via CI/CD

O sistema DEVE suportar tanto deploy manual via Makefile quanto deploy automatizado via trigger de branch (ex: push na main).

#### Scenario: Deploy manual via Makefile
- **WHEN** `make deploy` é executado localmente com `gcloud` autenticado
- **THEN** o serviço Cloud Run é atualizado com a versão corrente do código

#### Scenario: Deploy automatizado detecta nova versão
- **WHEN** um push é feito na branch principal do repositório
- **THEN** um pipeline de CI/CD (Cloud Build ou GitHub Actions) faz build, push e deploy automaticamente

### Requirement: Health check endpoint para Cloud Run

O sistema DEVE expor um endpoint de health check que o Cloud Run usa para verificar se a instância está saudável.

#### Scenario: Cloud Run verifica saúde da instância
- **WHEN** Cloud Run faz requisição GET para `/healthz`
- **THEN** o sistema retorna HTTP 200 se a aplicação está rodando e o banco de dados está acessível
