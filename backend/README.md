# 🚀 Altaa.ai Backend - API Multi-tenant

> API REST robusta e escalável construída com NestJS, Prisma e PostgreSQL

[![NestJS](https://img.shields.io/badge/NestJS-10.3-red?logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.8-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)](https://www.postgresql.org/)
[![Swagger](https://img.shields.io/badge/Swagger-7.2-green?logo=swagger)](https://swagger.io/)

## 📋 Sobre

A **Altaa.ai API** é o backend da plataforma multi-tenant, fornecendo endpoints RESTful seguros e bem documentados para autenticação, gerenciamento de empresas, convites e controle de permissões.

### 🎯 Características Principais

- **Arquitetura Modular**: Organização clara com módulos NestJS
- **Multi-tenancy Seguro**: Isolamento de dados por empresa
- **JWT Authentication**: Token-based auth em cookies httpOnly
- **Validação Automática**: Class-validator em todos os DTOs
- **Documentação Swagger**: Gerada automaticamente
- **Testes E2E**: Cobertura completa de endpoints
- **Type Safety**: TypeScript em todo o código
- **ORM Prisma**: Queries type-safe e migrations

---

## 🌐 Demonstração

### Produção

- **API Base**: [https://api-altaa.gabrielfeijo.com.br](https://api-altaa.gabrielfeijo.com.br)
- **Swagger Docs**: [https://api-altaa.gabrielfeijo.com.br/api/docs](https://api-altaa.gabrielfeijo.com.br/api/docs)

### Desenvolvimento Local

- **API Base**: [http://localhost:3333](http://localhost:3333)
- **Swagger Docs**: [http://localhost:3333/api/docs](http://localhost:3333/api/docs)

---

## 🚀 Instalação

### Pré-requisitos

- Node.js 18 ou superior
- PostgreSQL 16 (ou Docker)
- npm ou yarn

### Método 1: Docker (Recomendado)

```bash
docker-compose up -d postgres backend
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npm run prisma:seed
```

### Método 2: Instalação Manual

1. **Clone e instale dependências**

   ```bash
   git clone https://github.com/GabrielFeijo/desafio-altaa.git
   cd altaa.ai/backend
   npm install
   ```

2. **Configure variáveis de ambiente**

   ```bash
   cp .env.example .env
   ```

   Edite `.env`:

   ```env
   DATABASE_URL="postgresql://altaa:altaa123@localhost:5432/altaa_db"
   JWT_SECRET="chavesecreta"
   JWT_EXPIRES_IN="7d"
   NODE_ENV="development"
   PORT=3333
   ```

3. **Configure o banco de dados**

   ```bash
   # Gerar Prisma Client
   npm run prisma:generate

   # Executar migrations
   npm run prisma:migrate

   # Popular com dados de teste
   npm run prisma:seed
   ```

4. **Inicie o servidor**

   ```bash
   # Desenvolvimento
   npm run start:dev

   # Produção
   npm run build
   npm run start:prod
   ```

---

## 📚 Documentação da API

### Swagger UI

Com a aplicação rodando, acesse:

**Desenvolvimento**: [http://localhost:3333/api/docs](http://localhost:3333/api/docs)

**Produção**: [https://api-altaa.gabrielfeijo.com.br/api/docs](https://api-altaa.gabrielfeijo.com.br/api/docs)

### Testando Endpoints Protegidos

1. **Faça login** via `POST /auth/login`
2. **Teste endpoints** protegidos

---

## 🔧 Endpoints Principais

### 🔐 Autenticação

| Método | Endpoint              | Descrição                | Autenticação |
| ------ | --------------------- | ------------------------ | ------------ |
| `POST` | `/auth/signup`        | Registrar novo usuário   | ❌           |
| `POST` | `/auth/login`         | Login e obter JWT        | ❌           |
| `POST` | `/auth/accept-invite` | Aceitar convite          | ❌           |
| `POST` | `/auth/me`            | Perfil do usuário logado | ✅           |
| `POST` | `/auth/logout`        | Logout                   | ✅           |

### 🏢 Empresas

| Método | Endpoint              | Descrição                | Permissão        |
| ------ | --------------------- | ------------------------ | ---------------- |
| `POST` | `/company`            | Criar empresa            | Qualquer usuário |
| `GET`  | `/companies`          | Listar minhas empresas   | Qualquer usuário |
| `GET`  | `/company/:id`        | Detalhes da empresa      | Membro           |
| `PUT`  | `/company/:id`        | Atualizar empresa        | OWNER/ADMIN      |
| `POST` | `/company/:id/select` | Selecionar empresa ativa | Membro           |

### 👥 Membros

| Método   | Endpoint                               | Descrição        | Permissão   |
| -------- | -------------------------------------- | ---------------- | ----------- |
| `POST`   | `/company/:id/invite`                  | Convidar membro  | OWNER/ADMIN |
| `GET`    | `/company/:id/invites`                 | Listar convites  | Membro      |
| `DELETE` | `/company/:companyId/invite/:inviteId` | Cancelar convite | OWNER/ADMIN |
| `PATCH`  | `/company/:companyId/member/:memberId` | Atualizar papel  | OWNER/ADMIN |
| `DELETE` | `/company/:companyId/member/:memberId` | Remover membro   | OWNER/ADMIN |

### 👤 Usuários

| Método | Endpoint         | Descrição        | Permissão   |
| ------ | ---------------- | ---------------- | ----------- |
| `GET`  | `/user/profile`  | Meu perfil       | Autenticado |
| `PUT`  | `/user/profile`  | Atualizar perfil | Autenticado |
| `PUT`  | `/user/password` | Alterar senha    | Autenticado |

### 🔍 Convites

| Método | Endpoint                     | Descrição     | Autenticação |
| ------ | ---------------------------- | ------------- | ------------ |
| `GET`  | `/invite/validate?token=xxx` | Validar token | ❌           |

---

## 🏗️ Arquitetura

### Estrutura de Diretórios

```
backend/
├── prisma/
│   ├── schema.prisma          # Schema do banco de dados
│   ├── seed.ts               # Dados iniciais
│   └── migrations/           # Histórico de migrações
│
├── src/
│   ├── auth/                 # Autenticação JWT
│   │   ├── dto/             # DTOs de entrada
│   │   ├── guards/          # Guards de proteção
│   │   ├── strategies/      # Estratégias Passport
│   │   ├── decorators/      # Decorators personalizados
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   │
│   ├── user/                # Gerenciamento de usuários
│   │   ├── dto/
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   └── user.module.ts
│   │
│   ├── company/             # Gerenciamento de empresas
│   │   ├── dto/
│   │   ├── company.controller.ts
│   │   ├── company.service.ts
│   │   └── company.module.ts
│   │
│   ├── membership/          # Relacionamento User-Company
│   │   ├── dto/
│   │   ├── membership.controller.ts
│   │   ├── membership.service.ts
│   │   └── membership.module.ts
│   │
│   ├── invite/              # Sistema de convites
│   │   ├── dto/
│   │   ├── invite.controller.ts
│   │   ├── invite.service.ts
│   │   └── invite.module.ts
│   │
│   ├── prisma/              # Prisma Service Global
│   │   ├── prisma.service.ts
│   │   └── prisma.module.ts
│   │
│   ├── common/              # Recursos compartilhados
│   │   ├── decorators/     # @CurrentUser, @Roles
│   │   └── guards/         # RolesGuard
│   │
│   ├── app.module.ts        # Módulo raiz
│   └── main.ts             # Bootstrap da aplicação
│
├── test/
│   ├── app.e2e-spec.ts     # Testes E2E
│   └── jest-e2e.json       # Config Jest E2E
│
├── Dockerfile              # Imagem Docker
├── .env.example            # Exemplo de variáveis
├── package.json
└── tsconfig.json
```

### Fluxo de Requisição

```
┌──────────────┐
│   Cliente    │
└──────┬───────┘
       │ HTTP Request
       ▼
┌──────────────────────┐
│   NestJS Server      │
│                      │
│  1. Controller       │ ◄─── Recebe requisição
│      │               │
│      ▼               │
│  2. Guard            │ ◄─── Valida JWT e permissões
│      │               │
│      ▼               │
│  3. Validation Pipe │ ◄─── Valida DTO
│      │               │
│      ▼               │
│  4. Service          │ ◄─── Lógica de negócio
│      │               │
│      ▼               │
│  5. Prisma           │ ◄─── Query no banco
│      │               │
│      ▼               │
│  6. Database         │ ◄─── PostgreSQL
└──────────────────────┘
```

### Migrações

```bash
# Criar migration
npm run prisma:migrate

# Aplicar migrations
npx prisma migrate deploy

# Resetar banco (CUIDADO!)
npx prisma migrate reset
```

### Prisma Studio

Interface visual para o banco de dados:

```bash
npm run prisma:studio
# Acesse http://localhost:5555
```

---

## 🧪 Testes

### Executar Testes E2E

```bash
# Todos os testes
npm run test:e2e

# Com cobertura
npm run test:cov

# Watch mode
npm run test:watch
```
