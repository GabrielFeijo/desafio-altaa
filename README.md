# 🚀 Altaa.ai - Plataforma Multi-tenant

> Plataforma completa de gerenciamento multi-tenant com controle granular de permissões, sistema de convites e autenticação segura via JWT.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.3-red?logo=nestjs)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](https://www.docker.com/)

## 📋 Sobre o Projeto

O **Altaa.ai** é uma plataforma full-stack desenvolvida como teste técnico, demonstrando arquitetura moderna e boas práticas de desenvolvimento. O sistema permite que usuários criem e gerenciem múltiplas empresas, convidem membros com diferentes níveis de permissão e controlem acessos de forma segura e eficiente.

### 🎯 Destaques Técnicos

- **Arquitetura Multi-tenant**: Isolamento completo de dados por empresa
- **Sistema de Permissões**: 3 níveis hierárquicos (OWNER, ADMIN, MEMBER)
- **Autenticação Segura**: JWT em cookies httpOnly com SameSite strict
- **Convites com Token**: Sistema de convite único com expiração
- **Server-Side Rendering**: Next.js 15 com App Router
- **API RESTful**: NestJS com documentação Swagger automática
- **Testes E2E**: Cobertura completa de casos de uso
- **Docker Ready**: Containerização completa com Docker Compose

---

## 🌐 Demonstração Online

### Aplicações em Produção

| Serviço          | URL                                                                                      | Descrição            |
| ---------------- | ---------------------------------------------------------------------------------------- | -------------------- |
| **Frontend**     | [altaa.gabrielfeijo.com.br](https://altaa.gabrielfeijo.com.br)                           | Interface do usuário |
| **Backend**      | [api-altaa.gabrielfeijo.com.br](https://api-altaa.gabrielfeijo.com.br)                   | API REST             |
| **Documentação** | [api-altaa.gabrielfeijo.com.br/api/docs](https://api-altaa.gabrielfeijo.com.br/api/docs) | Swagger UI           |

### 👥 Usuários de Teste

Após executar o seed do banco de dados, os seguintes usuários estarão disponíveis:

```
Email: owner@altaa.ai
Senha: desafio@altaa
Papel: Proprietário (controle total)

Email: admin@altaa.ai
Senha: desafio@altaa
Papel: Administrador (gerenciamento limitado)

Email: member@altaa.ai
Senha: desafio@altaa
Papel: Membro (acesso de leitura)
```

---

## 🚀 Início Rápido

### Pré-requisitos

Certifique-se de ter instalado:

- [Docker](https://www.docker.com/get-started) 20.10+
- [Docker Compose](https://docs.docker.com/compose/install/) 2.0+
- [Make](https://www.gnu.org/software/make/) (opcional, para comandos simplificados)

### 🐳 Instalação com Docker (Recomendado)

1. **Clone o repositório**

   ```bash
   git clone https://github.com/GabrielFeijo/desafio-altaa.git
   cd desafio-altaa
   ```

2. **Inicie os serviços**

   ```bash
   make up
   ```

   Ou sem Make:

   ```bash
   docker-compose up -d
   ```

3. **Aguarde a inicialização** (primeira vez pode levar 2-3 minutos)

4. **Acesse as aplicações**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend: [http://localhost:3333](http://localhost:3333)
   - Swagger: [http://localhost:3333/api/docs](http://localhost:3333/api/docs)

### 🗄️ Configuração do Banco de Dados

Após os serviços estarem rodando, execute as migrações e seed:

```bash
# Executar migrações
make migrate

# Popular banco com dados de teste
make seed
```

Ou sem Make:

```bash
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npm run prisma:seed
```

---

## 📦 Estrutura do Projeto

```
altaa.ai/
├── backend/                    # API NestJS
│   ├── prisma/                # Schema e migrações
│   │   ├── schema.prisma      # Modelo de dados
│   │   ├── seed.ts           # Dados iniciais
│   │   └── migrations/       # Histórico de migrações
│   ├── src/
│   │   ├── auth/             # Autenticação JWT
│   │   ├── company/          # Gerenciamento de empresas
│   │   ├── user/             # Gerenciamento de usuários
│   │   ├── membership/       # Relacionamento User-Company
│   │   ├── invite/           # Sistema de convites
│   │   ├── prisma/           # Prisma Service
│   │   └── common/           # Guards, decorators, filters
│   ├── test/                 # Testes E2E
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                   # App Next.js
│   ├── src/
│   │   ├── app/              # App Router (Next.js 15)
│   │   │   ├── (auth)/       # Rotas públicas
│   │   │   ├── (dashboard)/  # Rotas protegidas
│   │   │   └── accept-invite/ # Aceitar convite
│   │   ├── components/       # Componentes React
│   │   │   ├── ui/           # shadcn/ui components
│   │   │   ├── layout/       # Header, Sidebar
│   │   │   ├── dashboard/    # Dashboard components
│   │   │   └── forms/        # Formulários
│   │   ├── lib/              # Utilitários
│   │   │   └── actions/      # Server Actions
│   │   ├── services/         # API Client
│   │   └── types/            # TypeScript types
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml          # Orquestração de serviços
├── makefile                    # Comandos facilitados
└── README.md                   # Este arquivo
```

---

## 🛠️ Comandos do Makefile

O projeto inclui um Makefile com comandos úteis para desenvolvimento:

### Comandos Principais

```bash
make up              # Inicia todos os serviços
make down            # Para todos os serviços
make restart         # Reinicia todos os serviços
make logs            # Exibe logs de todos os serviços
make clean           # Remove containers e volumes
```

### Comandos de Desenvolvimento

```bash
make logs-backend    # Logs apenas do backend
make logs-frontend   # Logs apenas do frontend
make logs-db         # Logs do PostgreSQL
make ps              # Status dos containers
```

### Comandos do Banco de Dados

```bash
make migrate         # Executa migrações do Prisma
make seed            # Popula banco com dados de teste
make studio          # Abre Prisma Studio (GUI do banco)
make shell-db        # Acessa PostgreSQL via psql
```

### Comandos de Build

```bash
make build           # Reconstrói todas as imagens Docker
make rebuild         # Reconstrói e inicia serviços
```

---

## 🧪 Testes

### Backend (NestJS)

```bash
# Testes E2E completos
make test-e2e

# Ou sem Make
docker-compose exec backend npm run test:e2e
```

### Frontend (Next.js)

```bash
cd frontend
npm run test
```

---

## 📊 Tecnologias Utilizadas

### Backend

| Tecnologia      | Versão | Uso                 |
| --------------- | ------ | ------------------- |
| NestJS          | 10.3   | Framework principal |
| Prisma          | 5.8    | ORM e migrations    |
| PostgreSQL      | 16     | Banco de dados      |
| JWT             | 10.2   | Autenticação        |
| Bcrypt          | 5.1    | Hash de senhas      |
| Class Validator | 0.14   | Validação de DTOs   |
| Swagger         | 7.2    | Documentação da API |

### Frontend

| Tecnologia      | Versão | Uso                          |
| --------------- | ------ | ---------------------------- |
| Next.js         | 15.5   | Framework React com SSR      |
| React           | 19.1   | Biblioteca UI                |
| TypeScript      | 5.3    | Type safety                  |
| Tailwind CSS    | 3.4    | Estilização                  |
| shadcn/ui       | Latest | Componentes UI               |
| Axios           | 1.13   | Cliente HTTP                 |
| React Hook Form | 7.66   | Gerenciamento de formulários |
| Zod             | 4.1    | Validação de schemas         |
| Sonner          | 2.0    | Toast notifications          |

---

## 🔧 Configuração de Ambiente

### Backend (.env)

```env
# Banco de Dados
DATABASE_URL="postgresql://altaa:altaa123@postgres:5432/altaa_db"

# JWT
JWT_SECRET="chavesecreta"
JWT_EXPIRES_IN="7d"

# Servidor
NODE_ENV="production"
PORT=3333
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL="http://localhost:3333"
```

## 📝 Documentação Adicional

- [README Backend](./backend/README.md) - Documentação detalhada do backend
- [README Frontend](./frontend/README.md) - Documentação detalhada do frontend
