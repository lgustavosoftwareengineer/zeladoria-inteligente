# Zeladoria Inteligente

Sistema de triagem inteligente de relatos urbanos. Cidadãos descrevem um problema urbano (título, descrição, localização) e a IA classifica automaticamente a categoria, prioridade e gera um resumo técnico para administradores públicos.

| | Link |
|---|---|
| **Frontend** | https://zeladoria-inteligente-web.vercel.app |
| **API** | https://ydrbaon8dh.execute-api.us-east-1.amazonaws.com |
| **Swagger UI** | indisponível em produção |

## Estrutura do monorepo

```
/
├── apps/
│   ├── api/          # NestJS — REST API + integração LLM
│   └── web/          # Next.js — Interface do cidadão
├── docs/
│   └── DESCRIPTION.MD
└── package.json      # Workspaces + Husky + lint-staged
```

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, TanStack Query |
| Backend | NestJS, TypeScript strict, TypeORM |
| Banco de dados | PostgreSQL via Supabase (free tier) |
| IA | OpenRouter → `google/gemini-2.5-flash` |
| Validação | Zod (LLM + env) · class-validator (DTOs HTTP) |
| Infra | Terraform · AWS Lambda + API Gateway + SSM |
| Deploy | Vercel (frontend) · AWS Lambda (backend) |

---

## Arquitetura geral

### Diagrama de sequência — fluxo completo

```mermaid
sequenceDiagram
    actor Cidadão
    participant Web as Next.js (Vercel)
    participant API as NestJS (AWS Lambda)
    participant DB as PostgreSQL (Supabase)
    participant LLM as OpenRouter (Gemini 2.5 Flash)
    participant Audit as Tabela audit_logs

    Cidadão->>Web: Preenche formulário e envia
    Web->>Web: Validação React Hook Form + Zod
    Web->>API: POST /api/reports { title, description, location }

    API->>API: Valida DTO (class-validator)
    API->>DB: Salva relato com dados padrão (categoria/prioridade provisória)

    API->>LLM: Envia prompt de triagem (temperatura 0.1, json_object)
    Note over API,LLM: Até 3 tentativas com retry

    alt LLM responde com sucesso
        LLM-->>API: JSON { category, priority, technical_summary }
        API->>API: Valida resposta com Zod (LlmOutputSchema)
        API->>DB: Atualiza relato com dados enriquecidos
        API->>Audit: Registra evento llm_succeeded (prompt, resposta, latência)
        API-->>Web: 201 ReportResponseDto (relato enriquecido)
        Web->>Cidadão: Exibe resultado com categoria, prioridade e resumo
    else LLM indisponível ou resposta inválida (3 falhas)
        LLM-->>API: Erro / JSON inválido
        API->>Audit: Registra evento llm_failed (prompt, mensagem de erro)
        API-->>Web: 503 / 422
        Web->>Cidadão: Exibe mensagem de erro amigável
    end
```

### Diagrama de componentes — visão geral do sistema

```mermaid
graph TB
    subgraph Vercel["Vercel (Frontend)"]
        Web["Next.js App<br/>apps/web"]
    end

    subgraph AWS["AWS (Backend)"]
        APIGW["API Gateway HTTP"]
        Lambda["Lambda Function<br/>NestJS"]
        SSM["SSM Parameter Store<br/>(secrets)"]
    end

    subgraph Supabase["Supabase"]
        PG["PostgreSQL<br/>reports + audit_logs"]
    end

    subgraph OpenRouter["OpenRouter"]
        Gemini["google/gemini-2.5-flash"]
    end

    Cidadão([Cidadão]) --> Web
    Web -->|"POST /api/reports"| APIGW
    APIGW --> Lambda
    Lambda -->|"lê secrets na inicialização"| SSM
    Lambda -->|"TypeORM"| PG
    Lambda -->|"openai SDK (baseURL customizada)"| Gemini
```

---

## Executando o projeto localmente

### Pré-requisitos

- Node.js 22+
- Docker + Docker Compose (para o PostgreSQL local)
- Uma chave da OpenRouter — veja [como criar abaixo](#obtendo-uma-chave-da-openrouter)

### Instalação

```bash
# Na raiz do monorepo — instala dependências de todos os workspaces
npm install
```

### Obtendo uma chave da OpenRouter

1. Acesse [openrouter.ai](https://openrouter.ai) e crie uma conta gratuita
2. No dashboard, vá em **Keys → Create Key**
3. O modelo `google/gemini-2.5-flash` tem créditos gratuitos disponíveis para novos usuários
4. Copie a chave gerada (formato `sk-or-v1-...`)

> Para um guia visual passo a passo, consulte a [documentação oficial da OpenRouter](https://openrouter.ai/docs/api-keys).

### Rodando a API

```bash
# 1. Suba o banco de dados local
cd apps/api
docker-compose up -d postgres

# 2. Configure as variáveis de ambiente
cp .env.example .env
# Edite .env:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/zeladoria
# OPENROUTER_API_KEY=sk-or-v1-...

# 3. Inicie a API em modo watch
cd ../..
npm run dev:api
# API disponível em http://localhost:3001
# Swagger UI em http://localhost:3001/api/docs
```

### Rodando o frontend

```bash
# Em outro terminal
cd apps/web
cp .env.example .env.local
# Edite .env.local: NEXT_PUBLIC_API_URL=http://localhost:3001

npm run dev
# Frontend disponível em http://localhost:3000
```

---

## Testes

Na raiz do monorepo:

```bash
npm run test        # API + frontend (ambos)
npm run test:api    # só API
npm run test:web    # só frontend
```

O pre-commit (Husky) executa `test:api` e `test:web` antes de cada commit.

---

## Deploy

| Serviço | Plataforma | Documentação |
|---|---|---|
| Frontend | Vercel (push para `main`) | [apps/web/README.md](apps/web/README.md) |
| Backend | AWS Lambda via GitHub Actions | [apps/api/README.md](apps/api/README.md) |
| Infra | Terraform (`apps/api/infra/`) | [apps/api/README.md](apps/api/README.md) |

---

## Documentação detalhada

- [API — NestJS](apps/api/README.md)
- [Frontend — Next.js](apps/web/README.md)
