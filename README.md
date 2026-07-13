# WBC E-commerce API

API REST de gerenciamento de produtos e categorias para e-commerce.

**Stack:** Node.js 22 + NestJS + Fastify + TypeScript 6 + Prisma + PostgreSQL + Redis

---

## Pré-requisitos

- Node.js 22+
- Docker e Docker Compose (ou PostgreSQL 16 + Redis 7 locais)

---

## Como rodar

### Com Docker (recomendado)

```bash
cp .env.example .env
docker compose up --build
```

A API estará disponível em `http://localhost:3000`
Documentação Swagger: `http://localhost:3000/docs`

### Sem Docker

```bash
cp .env.example .env
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run start:dev
```

---

## Configuração do banco (.env)

```env
DATABASE_URL=postgresql://wbc:wbc123@localhost:5432/wbc_ecommerce
REDIS_URL=redis://localhost:6379
CORS_ORIGIN=http://localhost:5173
PORT=3000
```

---

## Migrations e Seed

```bash
npx prisma migrate dev --name init    # cria tabelas
npx prisma db seed                     # popula dados de exemplo + documenta colunas
```

O seed cria 6 categorias e 21 produtos de exemplo com dados realistas.

---

## Testes

```bash
npm run test          # unitários + integração
npm run test:cov      # com cobertura
```

---

## API Endpoints

### Categorias

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/categories` | Criar categoria |
| `GET` | `/categories?page=1&limit=10&status=1` | Listar (paginação + filtro status) |
| `GET` | `/categories/:id` | Buscar por ID (inclui produtos) |
| `PUT` | `/categories/:id` | Atualizar |
| `DELETE` | `/categories/:id` | Excluir (soft delete — bloqueado se houver produtos) |

### Produtos

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/products` | Criar produto |
| `GET` | `/products?page=1&limit=10&categoryId=1&priceMin=10&priceMax=100&search=nome&status=1` | Listar com filtros |
| `GET` | `/products/:id` | Buscar por ID (inclui categoria) |
| `PUT` | `/products/:id` | Atualizar |
| `DELETE` | `/products/:id` | Excluir (soft delete) |

### Filtros disponíveis no GET /products

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `page` | number | Página (default: 1) |
| `limit` | number | Itens por página (default: 10) |
| `status` | string | 0=Rascunho, 1=Ativo, 2=Deletado (default: 1) |
| `categoryId` | number | Filtrar por categoria |
| `priceMin` | number | Preço mínimo |
| `priceMax` | number | Preço máximo |
| `search` | string | Busca parcial por nome (case-insensitive) |

### Status dos registros (soft delete)

| Status | Significado | Visível por padrão? |
|--------|-------------|---------------------|
| 0 | Rascunho | Não |
| 1 | Ativo | Sim |
| 2 | Deletado | Não |

Para listar rascunhos e ativos: `?status=0,1`

---

## Estrutura do projeto

```
src/
├── main.ts                  # bootstrap, CORS, Helmet, Swagger, pipes globais
├── app.module.ts            # módulo raiz (Cache, Throttler, Prisma)
├── common/
│   ├── global-exception.filter.ts    # tratamento centralizado de erros
│   └── response-transform.interceptor.ts  # padronização de respostas
├── prisma/
│   ├── prisma.module.ts
│   └── prisma.service.ts
└── modules/
    ├── categories/
    │   ├── categories.module.ts
    │   ├── categories.controller.ts
    │   ├── categories.service.ts
    │   └── categories.dto.ts
    └── products/
        ├── products.module.ts
        ├── products.controller.ts
        ├── products.service.ts
        └── products.dto.ts
```

---

## Decisões técnicas

### NestJS + FastifyAdapter

O NestJS roda sobre o Fastify, atendendo o requisito "Express ou Fastify" do teste.
Fastify oferece throughput 2-3x superior ao Express, schema validation nativo e
suporte first-class a pino logger.

### Prisma + PostgreSQL

ORM tipado com migrations declarativas, transações nativas e tipagem automática
do schema do banco via `prisma generate`.

### Redis — Cache-Aside

Cache com invalidação na escrita. Listagens cacheadas por 60s, detalhes de produto
por 300s. Toda operação de escrita (POST/PUT/DELETE) invalida o cache.

### Soft Delete

Registros nunca são removidos fisicamente. O campo `status` controla a visibilidade
(0=rascunho, 1=ativo, 2=deletado) com `deletedAt` para auditoria.

### Tratamento de erros

`GlobalExceptionFilter` captura exceções HTTP, Prisma (P2025 = not found) e erros
genéricos, retornando sempre o formato padronizado:

```json
{
  "success": false,
  "message": "Produto não encontrado",
  "statusCode": 404,
  "timestamp": "2026-07-13T12:00:00.000Z"
}
```

### Respostas de sucesso

`ResponseTransformInterceptor` envolve toda resposta bem-sucedida em:

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-07-13T12:00:00.000Z"
}
```

### Segurança

- **CORS** configurável via `CORS_ORIGIN`
- **Helmet** para headers de segurança HTTP
- **Rate Limiting** (100 req/min por IP)
- **ValidationPipe** com `whitelist` e `forbidNonWhitelisted`

### Docker

**Multi-stage build (builder → runtime Alpine):**
- Stage 1 (builder): instala todas as dependências, compila TypeScript, depois
  executa `npm ci --omit=dev` removendo devDependencies (eslint, vitest, prettier…)
- Stage 2 (runtime): copia apenas `dist/`, `node_modules/` (só produção) e
  `prisma/` — sem código fonte, sem devDeps
- Resultado: imagem ~37% menor que sem `--omit=dev` (1.17GB vs 1.85GB)

**Segurança:**
- Usuário não-root `scraper` (princípio de menor privilégio)
- Alpine Linux como base (superfície de ataque reduzida)
- PostgreSQL 16 + Redis 7 com healthchecks no `docker-compose.yml`

### CI/CD (.gitlab-ci.yml)

Pipeline com 4 stages:

| Stage | O que faz | Cache |
|-------|-----------|-------|
| `lint` | ESLint — falha se código fora do padrão | `node_modules/` |
| `test` | Vitest + coverage (artefato Cobertura) | `node_modules/` |
| `build` | Docker-in-Docker — build da imagem sem cache de layers | Nenhum |
| `deploy` | Deploy (simulado — pronto para produção) | — |

**Build sem cache de layers:** o stage `build` usa `docker build` puro, sem
`--cache-from`. Cada execução gera uma imagem limpa e 100% reprodutível a
partir do fonte. Trade-off: builds mais lentos (~2-3min), mas zero risco de
cache corrompido ou camadas stale.
