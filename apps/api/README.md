# API — Zeladoria Inteligente

NestJS REST API com integração de LLM para triagem automática de relatos urbanos.

## Sumário

- [Arquitetura](#arquitetura)
- [Módulos](#módulos)
- [Banco de dados](#banco-de-dados)
- [Contrato da API](#contrato-da-api)
- [Executando localmente](#executando-localmente)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Testes](#testes)
- [Infraestrutura](#infraestrutura)

---

## Arquitetura

A API segue o padrão **Ports & Adapters** com organização por módulos de feature. Código compartilhado reside exclusivamente em `core/` — nenhum módulo de feature importa de outro.

### Diagrama de componentes — módulos NestJS

```mermaid
graph TB
    subgraph core["core/ — infraestrutura compartilhada"]
        Config["config/<br/>Zod env validation"]
        Domain["domain/<br/>Category · Priority"]
        Errors["errors/<br/>LlmParseError<br/>LlmValidationError<br/>LlmUnavailableError"]
        Ports["ports/<br/>ILlmAnalyzer<br/>IAuditLogger<br/>IConfigReader"]
        Filter["filters/<br/>GlobalExceptionFilter"]
        DB["database/<br/>TypeORM async config"]
    end

    subgraph reports["reports/ — feature"]
        RC["ReportsController<br/>POST · GET /reports<br/>GET /reports/:id"]
        RS["ReportsService"]
        RRepo["ReportsRepository"]
        RE["Report entity"]
    end

    subgraph llm["llm/ — feature (@Global)"]
        LS["LlmService<br/>implements ILlmAnalyzer"]
        ORP["OpenRouterProvider<br/>openai SDK + baseURL customizada"]
        Prompt["triage.prompt.ts<br/>função pura"]
        Schema["LlmOutputSchema (Zod)"]
    end

    subgraph audit["audit/ — feature (@Global)"]
        AS["AuditService<br/>implements IAuditLogger"]
        ARepo["AuditRepository"]
        AE["AuditLog entity"]
    end

    subgraph health["health/"]
        HC["GET /health"]
    end

    RC --> RS
    RS --> RRepo
    RS -->|"ILlmAnalyzer (token)"| LS
    RS -->|"IAuditLogger (token)"| AS
    LS --> ORP
    LS --> Prompt
    LS --> Schema
    AS --> ARepo
    RRepo --> RE
    ARepo --> AE
    RS --> Errors
    Filter --> Errors
```

### Diagrama de sequência — criação de um relato

```mermaid
sequenceDiagram
    participant Client as HTTP Client
    participant Controller as ReportsController
    participant Service as ReportsService
    participant Repo as ReportsRepository
    participant LLM as LlmService
    participant OR as OpenRouterProvider
    participant Zod as LlmOutputSchema
    participant Audit as AuditService
    participant DB as PostgreSQL

    Client->>Controller: POST /api/reports { title, description, location }
    Controller->>Controller: Valida CreateReportDto (class-validator)
    Controller->>Service: create(dto)

    Service->>Repo: save(relato com dados padrão)
    Repo->>DB: INSERT reports
    DB-->>Repo: Report { id, ... }

    loop Até 3 tentativas
        Service->>LLM: analyze(dto)
        LLM->>LLM: buildTriagePrompt(input)
        LLM->>OR: complete(prompt)
        OR->>OR: POST openrouter.ai/api/v1/chat/completions
        OR-->>LLM: raw string
        LLM->>LLM: extractJson(raw)
        LLM->>Zod: safeParse(parsed)
        alt JSON válido
            Zod-->>LLM: LlmAnalysisResult
            LLM-->>Service: LlmAnalysisResult
        else JSON inválido
            Note over LLM: LlmValidationError → retry
        end
    end

    alt Análise bem-sucedida
        Service->>Repo: save(relato enriquecido)
        Repo->>DB: UPDATE reports
        Service->>Audit: createLog(llm_succeeded)
        Audit->>DB: INSERT audit_logs
        Service-->>Controller: ReportResponseDto
        Controller-->>Client: 201 ReportResponseDto
    else 3 falhas consecutivas
        Service->>Audit: createLog(llm_failed)
        Audit->>DB: INSERT audit_logs
        Service-->>Controller: LlmUnavailableError
        Controller-->>Client: 503 Service Unavailable
    end
```

### Mapeamento de erros

```mermaid
sequenceDiagram
    participant Service
    participant Filter as GlobalExceptionFilter
    participant Client

    alt LlmUnavailableError
        Service->>Filter: throw LlmUnavailableError
        Filter-->>Client: 503
    else LlmValidationError / LlmParseError
        Service->>Filter: throw LlmValidationError
        Filter-->>Client: 422
    else DTO inválido
        Service->>Filter: BadRequestException
        Filter-->>Client: 400
    else Relato não encontrado
        Service->>Filter: NotFoundException
        Filter-->>Client: 404
    end
```

---

## Módulos

### `core/`

Infraestrutura compartilhada — nenhum módulo de feature importa de outro.

| Pasta       | Responsabilidade                                                                                                                    |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `config/`   | Valida `process.env` com Zod na inicialização (fail-fast)                                                                           |
| `domain/`   | Enums `Category` e `Priority` + arrays `CATEGORIES`/`PRIORITIES` — fonte única da verdade compartilhada com o prompt e o schema Zod |
| `errors/`   | `LlmParseError`, `LlmValidationError`, `LlmUnavailableError`                                                                        |
| `ports/`    | Interfaces `ILlmAnalyzer`, `IAuditLogger` e `IConfigReader` com tokens de injeção                                                   |
| `filters/`  | `GlobalExceptionFilter` — mapeia erros customizados para HTTP                                                                       |
| `database/` | Configuração assíncrona do TypeORM                                                                                                  |

### `reports/`

Orquestra o fluxo principal: recebe o DTO → salva rascunho → chama LLM → persiste relato enriquecido → registra auditoria.

### `llm/`

Marcado `@Global()`. Implementa `ILlmAnalyzer`:

- Constrói o prompt com `buildTriagePrompt()` (função pura, testável isoladamente)
- Chama `OpenRouterProvider` usando o SDK `openai` com `baseURL` customizada
- Extrai JSON da resposta (suporta markdown fences ` ```json `)
- Valida saída com `LlmOutputSchema` (Zod)
- **Retry:** até 3 tentativas com delay entre elas
- `temperature: 0.1` · `response_format: json_object`

### `audit/`

Marcado `@Global()`. Implementa `IAuditLogger`:

- Registra cada interação com o LLM em `audit_logs`
- `report_id` armazenado como UUID simples (sem `@ManyToOne`) para independência de módulo

### `health/`

`GET /health` → `200 OK` — usado pelo AWS Lambda e Docker healthcheck.

---

## Banco de dados

### `reports`

| Coluna              | Tipo         | Notas                         |
| ------------------- | ------------ | ----------------------------- |
| `id`                | UUID PK      | auto-gerado                   |
| `title`             | VARCHAR(255) | input do cidadão              |
| `description`       | TEXT         | input do cidadão              |
| `location`          | VARCHAR(500) | input do cidadão              |
| `category`          | VARCHAR(100) | saída do LLM                  |
| `priority`          | VARCHAR(50)  | `Baixa \| Média \| Alta`      |
| `technical_summary` | TEXT         | resumo técnico gerado pela IA |
| `created_at`        | TIMESTAMPTZ  | automático                    |

### `audit_logs`

| Coluna          | Tipo         | Notas                                       |
| --------------- | ------------ | ------------------------------------------- |
| `id`            | UUID PK      |                                             |
| `report_id`     | UUID         | FK lógica (sem relação TypeORM)             |
| `event_type`    | VARCHAR(50)  | `llm_called \| llm_succeeded \| llm_failed` |
| `provider`      | VARCHAR(100) | ex: `openrouter`                            |
| `model`         | VARCHAR(150) | ex: `google/gemini-2.5-flash`               |
| `prompt_sent`   | TEXT         | prompt completo enviado                     |
| `raw_response`  | TEXT         | nullable                                    |
| `error_message` | TEXT         | nullable                                    |
| `latency_ms`    | INTEGER      | nullable                                    |
| `created_at`    | TIMESTAMPTZ  | automático                                  |

---

## Contrato da API

| Ambiente | Base URL                                                     |
| -------- | ------------------------------------------------------------ |
| Local    | `http://localhost:3001/api`                                  |
| Produção | `https://ydrbaon8dh.execute-api.us-east-1.amazonaws.com/api` |

Swagger UI (apenas em desenvolvimento): `http://localhost:3001/api/docs`

| Método | Rota           | Status      | Descrição                         |
| ------ | -------------- | ----------- | --------------------------------- |
| `POST` | `/reports`     | `201`       | Cria e enriquece um relato via IA |
| `GET`  | `/reports`     | `200`       | Lista todos os relatos            |
| `GET`  | `/reports/:id` | `200 / 404` | Busca relato por UUID             |
| `GET`  | `/health`      | `200`       | Healthcheck                       |

**Erros:**

| Código | Causa                                                            |
| ------ | ---------------------------------------------------------------- |
| `400`  | DTO inválido (campos obrigatórios ausentes ou limites excedidos) |
| `404`  | Relato não encontrado                                            |
| `422`  | Resposta do LLM com formato ou schema inválido                   |
| `503`  | LLM indisponível após 3 tentativas                               |

---

## Executando localmente

### Pré-requisitos

- Node.js 22+
- Docker + Docker Compose
- Chave da OpenRouter — [como obter](../../README.md#obtendo-uma-chave-da-openrouter)

### Setup rápido

```bash
cd apps/api

# 1. Configure as variáveis de ambiente
cp .env.example .env
# Edite .env (veja seção abaixo)

# 2. Suba o PostgreSQL
docker-compose up -d postgres

# 3. Inicie a API em modo watch
npm run start:dev
# API em http://localhost:3001
# Swagger em http://localhost:3001/api/docs
```

### Docker Compose completo (API + banco)

```bash
cd apps/api
OPENROUTER_API_KEY=sk-or-v1-... docker-compose up --build
```

---

## Variáveis de ambiente

| Variável             | Obrigatória | Padrão                    | Descrição                                                                        |
| -------------------- | ----------- | ------------------------- | -------------------------------------------------------------------------------- |
| `DATABASE_URL`       | Sim         | —                         | Connection string PostgreSQL (ex: `postgresql://user:password@host:5432/dbname`) |
| `OPENROUTER_API_KEY` | Sim         | —                         | Chave da API OpenRouter (`sk-or-v1-...`)                                         |
| `PORT`               | Não         | `3001`                    | Porta HTTP                                                                       |
| `OPENROUTER_MODEL`   | Não         | `google/gemini-2.5-flash` | Modelo LLM                                                                       |
| `LLM_PROVIDER_NAME`  | Não         | `openrouter`              | Identificador do provider (auditoria)                                            |
| `CORS_ORIGIN`        | Não         | `http://localhost:3000`   | Origem permitida pelo CORS                                                       |
| `NODE_ENV`           | Não         | `development`             | Ambiente                                                                         |

---

## Testes

```bash
# Dentro do app
cd apps/api
npm run test        # unit tests
npm run test:cov    # com cobertura
npm run lint        # ESLint

# Ou na raiz do monorepo
npm run test:api   # roda os testes da API
```

Todos os testes seguem o padrão **AAA (Arrange → Act → Assert)** com comentários explícitos de seção. Não há testes E2E — apenas unitários.

---

## Infraestrutura

Todos os recursos AWS são gerenciados pelo Terraform em `infra/`.

### Recursos provisionados

```mermaid
graph LR
    subgraph AWS
        APIGW["API Gateway HTTP"]
        Lambda["Lambda Function<br/>nodejs22.x · 512MB · 30s"]
        SSM1["SSM SecureString<br/>DATABASE_URL"]
        SSM2["SSM SecureString<br/>OPENROUTER_API_KEY"]
        IAM["IAM Role<br/>lambda-execution"]
    end

    subgraph Estado
        S3["S3 Bucket<br/>tfstate"]
        DDB["DynamoDB<br/>state lock"]
    end

    APIGW -->|AWS_PROXY payload 2.0| Lambda
    Lambda --> SSM1
    Lambda --> SSM2
    IAM -->|assume role| Lambda
```

### Diagrama de sequência — provisionamento e deploy

```mermaid
sequenceDiagram
    participant Dev as Desenvolvedor
    participant TF as Terraform
    participant AWS
    participant GH as GitHub Actions
    participant Lambda as AWS Lambda

    Dev->>TF: terraform apply -var-file="terraform.tfvars"
    TF->>AWS: Cria API Gateway, Lambda (placeholder), SSM, IAM
    TF-->>Dev: outputs (API URL, Lambda ARN)

    Note over Dev,Lambda: Deploys subsequentes via CI/CD

    Dev->>GH: git push origin main
    GH->>GH: npm run build
    GH->>Lambda: aws lambda update-function-code
    Lambda-->>GH: deploy concluído
```

### Comandos

```bash
cd apps/api/infra

# Crie o arquivo de variáveis a partir do exemplo e edite com os valores reais
cp terraform.tfvars.example terraform.tfvars

terraform init
terraform plan  -var-file="terraform.tfvars"
terraform apply -var-file="terraform.tfvars"
```

O arquivo `terraform.tfvars` não é gerado automaticamente. Crie-o com `cp terraform.tfvars.example terraform.tfvars` e preencha os valores (ele não é commitado — `*.tfvars` está no `.gitignore` da pasta `infra/`). O `terraform.tfvars.example` contém apenas placeholders.
