# Frontend — Zeladoria Inteligente

Interface do cidadão para submissão de relatos urbanos. Next.js + TypeScript + Tailwind CSS.

## Sumário

- [Arquitetura](#arquitetura)
- [Features](#features)
- [Componentes globais](#componentes-globais)
- [Executando localmente](#executando-localmente)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Testes](#testes)

---

## Arquitetura

O frontend adota **vertical slices** (feature-based) com colocation fractal. O código vive tão perto quanto possível de onde é usado.

### Princípios

| Princípio               | Aplicação                                                                         |
| ----------------------- | --------------------------------------------------------------------------------- |
| **Colocation fractal**  | Componentes usados por apenas um pai vivem dentro desse pai em `components/`      |
| **Domain organization** | Organização por feature (`features/reports/`), não por tipo de arquivo            |
| **Boundary rules**      | Código externo importa **somente** de `@/features/reports` (o `index.ts` público) |
| **Relative imports**    | Dentro de uma feature, imports são relativos entre arquivos internos              |

### Estrutura de pastas

```
src/
├── app/                    # Routing Next.js, layout, providers — não importado por ninguém
│   ├── layout.tsx
│   ├── page.tsx
│   └── providers.tsx       # TanStack Query Provider
├── features/
│   └── reports/
│       ├── index.ts        # PUBLIC API — único arquivo que código externo importa
│       ├── components/
│       │   └── ReportForm/              # componente público da feature
│       │       ├── ReportForm.tsx
│       │       ├── index.ts
│       │       └── components/          # usados só pelo ReportForm (fractal)
│       │           ├── ReportFormFields/
│       │           │   ├── ReportFormFields.tsx
│       │           │   ├── index.ts
│       │           │   └── components/  # usados só pelo ReportFormFields (fractal)
│       │           │       ├── LocationDetailedFields/
│       │           │       └── LocationSimpleField/
│       │           ├── ReportFormLoading/
│       │           └── ReportFormSuccess/
│       │               └── components/  # usados só pelo ReportFormSuccess (fractal)
│       │                   └── PriorityBadge/
│       ├── hooks/
│       │   └── use-report-form.ts      # toda a lógica de estado do formulário
│       ├── requests/
│       │   └── create-report.ts        # POST /api/reports
│       ├── schemas/
│       │   └── report.schema.ts        # Zod + react-hook-form resolver
│       ├── types/
│       │   └── report.types.ts
│       ├── constants/
│       │   └── report-form.constants.ts
│       └── utils/
│           └── address.ts              # formatação de endereço para a API
├── components/
│   └── ui/                 # Componentes presentacionais globais reutilizáveis
│       ├── Badge/           # cva variants: danger, warn, success
│       ├── Button/          # cva variants: primary, secondary
│       ├── Field/           # wrapper estrutural sem variantes visuais
│       ├── Input/           # cn + readOnly condicional
│       ├── Textarea/        # cn + readOnly condicional
│       └── index.ts
├── services/
│   └── viacep/             # Wrapper ViaCEP (busca de endereço por CEP)
└── shared/
    └── cn.ts               # clsx + tailwind-merge
```

### Diagrama de componentes — feature `reports`

```mermaid
graph TB
    Page["app/page.tsx"]

    subgraph feature["features/reports (public API)"]
        Index["index.ts<br/>(exports ReportForm)"]

        subgraph ReportForm["ReportForm/"]
            RF["ReportForm.tsx<br/>orquestra estados: idle / loading / success"]
            Hook["use-report-form.ts<br/>React Hook Form + TanStack Query"]

            subgraph RFChildren["components/ (fractal)"]
                RFF["ReportFormFields<br/>formulário + submit"]
                RFL["ReportFormLoading<br/>skeleton animado"]
                RFS["ReportFormSuccess<br/>resultado enriquecido"]

                subgraph RFFChildren["ReportFormFields/components/"]
                    LDF["LocationDetailedFields<br/>CEP + endereço completo"]
                    LSF["LocationSimpleField<br/>texto livre"]
                end

                subgraph RFSChildren["ReportFormSuccess/components/"]
                    PB["PriorityBadge<br/>badge colorido por prioridade"]
                end
            end
        end
    end

    subgraph UI["components/ui/"]
        Badge
        Button
        Field
        Input
        Textarea
    end

    subgraph Services["services/"]
        ViaCEP["viacep/index.ts"]
    end

    Page --> Index
    Index --> RF
    RF --> Hook
    RF --> RFF
    RF --> RFL
    RF --> RFS
    RFF --> LDF
    RFF --> LSF
    RFS --> PB
    Hook --> ViaCEP
    RFF --> UI
    LDF --> UI
    LSF --> UI
```

### Diagrama de sequência — submissão do formulário

```mermaid
sequenceDiagram
    actor Cidadão
    participant RF as ReportForm
    participant Hook as useReportForm
    participant RHF as React Hook Form
    participant Zod as report.schema (Zod)
    participant Req as createReport()
    participant API as NestJS API

    Cidadão->>RF: Preenche título, descrição e localização
    Cidadão->>RF: Clica em "Enviar relato"

    RF->>Hook: form.handleSubmit(onSubmit)
    Hook->>RHF: valida campos
    RHF->>Zod: buildReportResolver(locationMode)(values)

    alt Validação falhou
        Zod-->>RHF: errors
        RHF-->>RF: exibe erros inline
        RF->>Cidadão: Campos marcados em vermelho
    else Validação ok
        Zod-->>Hook: values
        Hook->>Hook: formata location (simples ou endereço completo)
        Hook->>Req: reportMutation.mutate({ title, description, location })
        RF->>Cidadão: Exibe ReportFormLoading (skeleton)

        Req->>API: POST /api/reports
        API-->>Req: 201 ReportResponseDto

        Req-->>Hook: reportMutation.isSuccess = true
        Hook-->>RF: data = ReportResponseDto
        RF->>Cidadão: Exibe ReportFormSuccess (categoria, prioridade, resumo)
    end
```

### Diagrama de sequência — busca de endereço por CEP

```mermaid
sequenceDiagram
    actor Cidadão
    participant LDF as LocationDetailedFields
    participant Hook as useReportForm
    participant ViaCEP as services/viacep
    participant API as viacep.com.br

    Cidadão->>LDF: Digita CEP e sai do campo (blur)
    LDF->>Hook: handleCepBlur(event)
    Hook->>Hook: remove não-dígitos → verifica 8 dígitos
    Hook->>ViaCEP: cepMutation.mutate(cep)
    ViaCEP->>API: GET /ws/{cep}/json/

    alt CEP encontrado
        API-->>ViaCEP: { logradouro, bairro, localidade, uf }
        ViaCEP-->>Hook: address
        Hook->>Hook: setValue(street, neighborhood, city, state)
        Hook-->>LDF: campos preenchidos automaticamente
    else CEP inválido
        API-->>ViaCEP: erro / CEP não encontrado
        ViaCEP-->>Hook: Error
        Hook->>Hook: setError("cep", message)
        Hook-->>LDF: exibe erro no campo CEP
    end
```

---

## Features

### `reports/`

Vertical slice completo para submissão e exibição de relatos.

#### `useReportForm` — hook central

Concentra toda a lógica de estado:

- `React Hook Form` com resolver Zod dinâmico (modo `simple` ou `detailed`)
- `TanStack Query` para mutações assíncronas (`cepMutation`, `reportMutation`)
- Dois modos de localização: texto livre (`simple`) ou endereço completo via CEP (`detailed`)

#### Modos de localização

| Modo       | Campos                                               | Validação                                                         |
| ---------- | ---------------------------------------------------- | ----------------------------------------------------------------- |
| `simple`   | `locationText` (texto livre)                         | mín. 3 caracteres                                                 |
| `detailed` | CEP + logradouro + número + bairro + cidade + estado | CEP obrigatório (8 dígitos); demais campos preenchidos via ViaCEP |

#### Estados do formulário

```
idle → loading → success
         ↑           ↓
         └── "Novo relato" (reset)
```

---

## Componentes globais

Todos em `src/components/ui/`. Nenhum usa Shadcn UI — estilização apenas com Tailwind CSS.

| Componente | Padrão | Variantes                   |
| ---------- | ------ | --------------------------- |
| `Button`   | `cva`  | `primary`, `secondary`      |
| `Badge`    | `cva`  | `danger`, `warn`, `success` |
| `Field`    | `cn`   | — (wrapper estrutural)      |
| `Input`    | `cn`   | `readOnly` condicional      |
| `Textarea` | `cn`   | `readOnly` condicional      |

**Regra:** componentes com variantes visuais usam `cva`; sem variantes usam `cn` puro.

---

## Executando localmente

### Pré-requisitos

- Node.js 22+
- API rodando em `http://localhost:3001` — veja [apps/api/README.md](../api/README.md)

### Setup

```bash
cd apps/web

# 1. Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local

# 2. Instale dependências (se ainda não instalou na raiz)
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev
# Frontend em http://localhost:3000
```

---

## Variáveis de ambiente

| Variável              | Obrigatória | Padrão | Descrição                                     |
| --------------------- | ----------- | ------ | --------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | Sim         | —      | URL base da API (ex: `http://localhost:3001`) |

Exemplo de `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Em produção (Vercel), configure `NEXT_PUBLIC_API_URL` com a URL do API Gateway da AWS.

---

## Testes

```bash
cd apps/web

npm run test        # unit tests (Jest + React Testing Library)
npm run test:cov    # com cobertura
```

Os testes cobrem componentes individuais, o hook `useReportForm`, schemas Zod, requests e utilitários. Padrão **AAA (Arrange → Act → Assert)** em todos os arquivos.
