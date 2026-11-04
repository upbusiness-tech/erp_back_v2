# Deploy da API no Google Cloud Run

## Visão geral/topologia

A API usa o mesmo serviço Cloud Run, `erp-api`, em projetos GCP diferentes para
staging e produção. O `Makefile` recebe o ambiente por `ENV` e passa o projeto
explicitamente em cada comando `gcloud`; não dependa do projeto ativo no SDK.

O ambiente de staging mantém sua URL atual do Cloud Run. A produção terá uma
nova URL `*.run.app`, que deve ser configurada como a URL da API no frontend de
produção no Vercel.

O serviço define explicitamente `NODE_ENV=production` nos dois ambientes. A
aplicação não sincroniza o schema: alterações de banco devem ser executadas
deliberadamente com os comandos de baseline e migration descritos abaixo.

O endpoint de saúde é **`/health`**, e não `/healthz`. Uma resposta saudável
tem status HTTP 200 e indica `database:connected`.

### Ambientes publicados

| Ambiente | URL |
|---|---|
| staging | `https://erp-api-c6he5mpqea-rj.a.run.app` |
| production | `https://erp-api-727519443877.southamerica-east1.run.app` |

O Cloud Run também expõe cada serviço no formato
`https://erp-api-<hash>-<região>.a.run.app`; ambos apontam para o mesmo
serviço. Use a URL acima como URL da API no frontend de produção.

A aplicação de label no serviço de staging criou a revisão `erp-api-00025-668`
com a **mesma imagem** da revisão anterior (`sha256:7a1862ab...`), pois o
Cloud Run materializa metadados em uma revisão. Nenhuma variável ou imagem foi
alterada.

## Pré-requisitos

- Google Cloud SDK autenticado na conta com acesso aos dois projetos.
- Docker instalado e em execução.
- Acesso aos bancos Neon e aos segredos de cada ambiente.
- Acesso ao projeto Vercel do frontend correspondente.

O provisionamento habilita as APIs necessárias e cria o Artifact Registry e a
conta de serviço. Para produção, o primeiro deploy precisa construir e enviar
a imagem ao Artifact Registry do projeto novo; não há reutilização de imagem
entre projetos.

## Mapeamento de ambientes

| `ENV` | Projeto GCP (ID / nome de exibição) | Serviço Cloud Run | Região | Host Neon | `CORS_ORIGINS` |
|---|---|---|---|---|---|
| `staging` | `erp-v2-production` (ID legado imutável; **ERP v2 Staging**) | `erp-api` | `southamerica-east1` | `ep-steep-king-ac2rs3nj-pooler.sa-east-1.aws.neon.tech` | `https://erp-front-v2.vercel.app` |
| `production` | `erp-v2-prod` | `erp-api` | `southamerica-east1` | `ep-fragrant-recipe-acaskobk-pooler.sa-east-1.aws.neon.tech` | `https://www.uperp.online` |

O nome do serviço é o mesmo nos dois projetos. Em produção, a origem CORS não
possui barra ao final; a origem deve ser usada exatamente como exibida na
tabela.

## Arquivos de ambiente

- `.env`: desenvolvimento local; pode apontar para staging ou para o Docker
  local e deve usar `NODE_ENV=development`.
- `.env.staging` e `.env.production`: segredos e configurações de runtime de
  cada ambiente. São ignorados pelo Git e não devem ser versionados.
- `.env.example`: template versionado, apenas com placeholders e sem segredos.

Cada arquivo usado por um ambiente deve conter estas chaves obrigatórias:

```text
DB_HOST=
DB_PORT=
DB_USERNAME=
DB_PASSWORD=
DB_NAME=
DB_SSL=
JWT_COMPANY_SECRET=
JWT_EMPLOYEE_SECRET=
JWT_ADMIN_SECRET=
JWT_EXPIRATION_TIME=
CORS_ORIGINS=
FIREBASE_SERVICE_ACCOUNT=
MERCADO_PAGO_ACCESS_TOKEN=
MERCADO_PAGO_PUBLIC_KEY=
MERCADO_PAGO_WEBHOOK_SECRET=
MERCADO_PAGO_CLIENT_SECRET=
TZ=
PGTZ=
PGSSLMODE=
PGCHANNELBINDING=
NODE_ENV=
```

Em Cloud Run, `NODE_ENV=production` é definido explicitamente nos dois
serviços. O arquivo de ambiente é convertido pelo Makefile para o arquivo
temporário usado na atualização da revisão; não coloque valores reais no
`.env.example`.

## Comandos do Makefile

`ENV` é `staging` por padrão. Operações de produção que alteram o ambiente
exigem `CONFIRM=production`.

| Comando | Descrição |
|---|---|
| `make help` | Lista os comandos disponíveis. |
| `make config-check ENV=production` | Valida a configuração e o arquivo de ambiente. |
| `make provision ENV=production` | Idempotente: habilita `run.googleapis.com` e `artifactregistry.googleapis.com`, cria o registry `erp-api` em `southamerica-east1` e cria a conta de serviço `erp-api-run`. |
| `make build ENV=production` | Constrói a imagem e cria as tags com o SHA curto do Git e `latest`. |
| `make push ENV=production` | Envia as imagens ao Artifact Registry do projeto do ambiente. |
| `make deploy ENV=production CONFIRM=production` | Cria uma única revisão do Cloud Run e aplica as variáveis por um `--env-vars-file` gerado. |
| `make deploy-all ENV=production CONFIRM=production` | Executa `config-check`, `build`, `push`, `deploy` e `smoke`. |
| `make env ENV=production` | Atualiza somente as variáveis de ambiente, criando uma revisão. |
| `make smoke ENV=production` | Faz `GET /health` e espera HTTP 200 com `database:connected`. |
| `make rollback ENV=production` | Direciona o tráfego para a revisão anterior. |
| `make status ENV=production` | Mostra o estado do serviço. |
| `make url ENV=production` | Mostra a URL do serviço. |
| `make logs ENV=production` | Consulta os logs do serviço. |
| `make db-baseline ENV=production CONFIRM=production` | Executa o baseline único do banco. |
| `make migrate ENV=production CONFIRM=production` | Executa as migrations usando o arquivo de ambiente do ambiente. |

Substitua `production` por `staging` nos exemplos quando o objetivo for
staging. Para produção, mantenha `CONFIRM=production` nos comandos que
modificam dados ou serviço.

## Provisionamento inicial

O provisionamento é idempotente. Para um ambiente ainda não preparado, a
sequência é:

```bash
make config-check ENV=production
make provision ENV=production
make build ENV=production
make push ENV=production
```

No primeiro deploy de produção, `build` e `push` são obrigatórios no projeto
`erp-v2-prod`: a imagem do projeto de staging não é reutilizada entre projetos.
Depois, use o deploy e o smoke test:

```bash
make deploy ENV=production CONFIRM=production
make smoke ENV=production
```

O mesmo fluxo pode ser executado pelo atalho:

```bash
make deploy-all ENV=production CONFIRM=production
```

## Baseline de banco

O banco de produção foi criado por `synchronize` manual. O schema já está no
head, mas o banco não tinha:

- a tabela `migrations`;
- os cinco índices parciais do dashboard;
- as quatro permissões legadas `invoice_*` consolidadas.

Antes da próxima migration, execute uma única vez:

```bash
make db-baseline ENV=production CONFIRM=production
```

Esse comando cria a tabela `migrations` com oito linhas, cria os cinco índices
parciais do dashboard e consolida as permissões legadas `invoice_*`. O comando
`make migrate` recusa execução quando a tabela `migrations` não existe. Ele
carrega `.env.<env>` por meio de `DOTENV_CONFIG_PATH`.

Migrations **não** são executadas na inicialização do container. O mecanismo
`prestart:prod`/`RUN_MIGRATIONS` foi removido. Portanto, execute-as de forma
explícita e somente após conferir o ambiente e o banco.

## Deploy de produção

Para cada alteração de aplicação:

```bash
make config-check ENV=production
make build ENV=production
make push ENV=production
make deploy ENV=production CONFIRM=production
make smoke ENV=production
```

`make deploy` publica uma única revisão e injeta as variáveis usando o arquivo
de ambiente gerado. O banco não é alterado pelo deploy. Quando houver uma nova
migration, crie-a localmente e depois execute o comando `make migrate` com
`CONFIRM=production`, após o baseline:

```bash
make migrate ENV=production CONFIRM=production
```

## Corte do frontend

1. Execute o deploy de produção e obtenha a nova URL com `make url
   ENV=production`.
2. Configure essa URL, sem barra final, como a variável de URL da API no
   projeto de produção do Vercel.
3. Confirme que o backend usa
   `CORS_ORIGINS=https://www.uperp.online` exatamente, sem barra final.
4. Faça o deploy do frontend e valide o fluxo de login e uma chamada à API.

O frontend de staging continua usando a URL existente e
`https://erp-front-v2.vercel.app` como origem CORS.

## Rollback

Se a revisão nova apresentar problema, confira o estado e direcione o tráfego
para a revisão anterior:

```bash
make status ENV=production
make rollback ENV=production
make smoke ENV=production
```

O rollback do Cloud Run não desfaz alterações de banco. Avalie migrations
aplicadas separadamente antes de restaurar o tráfego.

## Troubleshooting

### CORS

Confira se `CORS_ORIGINS` é a origem exata, incluindo `https://` e sem barra
final. Staging e produção usam origens diferentes; não troque os valores entre
os ambientes.

### Cold start

O primeiro request após um período sem tráfego pode ser mais lento porque o
Cloud Run escala a zero. Valide primeiro com `make smoke ENV=...` antes de
investigar a aplicação.

### Conectividade ou SSL do banco

Confira `DB_HOST` usando o host pooler do Neon, as credenciais, `DB_SSL`,
`PGSSLMODE` e `PGCHANNELBINDING`. Use `make logs ENV=...` para consultar os
erros do serviço.

### JSON da conta de serviço Firebase

Valide se `FIREBASE_SERVICE_ACCOUNT` contém um JSON completo e válido do
ambiente correto. Não publique o JSON em `.env.example`, logs ou no Git.

### Bloqueio de migrations

Se `make migrate ENV=...` recusar a execução porque `migrations` está ausente,
execute primeiro o `make db-baseline` correspondente, com a confirmação exigida
para produção. Não habilite migrations no startup: esse mecanismo não existe
mais.

## Riscos aceitos

- O projeto Firebase `erp-v2-auth` é compartilhado entre staging e produção.
- As credenciais do Mercado Pago são compartilhadas; cobranças de staging são
  reais. O webhook de produção deve apontar para a URL de produção.
- As variáveis de ambiente ficam visíveis para `roles/run.viewer`. O uso do
  Secret Manager é uma etapa futura.
- Ainda não existe CI/CD; os comandos do Makefile são executados
  manualmente.
