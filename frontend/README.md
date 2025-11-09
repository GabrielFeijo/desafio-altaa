# 🎨 Altaa.ai Frontend - Interface Multi-tenant

> Interface moderna e responsiva construída com Next.js 15, React 19, Tailwind CSS e shadcn/ui

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

## 📋 Sobre

O **Altaa.ai Frontend** é a interface do usuário da plataforma multi-tenant, oferecendo uma experiência moderna, intuitiva e totalmente responsiva para gerenciamento de empresas e equipes.

### 🎯 Características Principais

- **Server-Side Rendering**: Next.js 15 com App Router
- **React Server Components**: Performance otimizada
- **Server Actions**: Comunicação tipo-safe com backend
- **Design System**: shadcn/ui + Tailwind CSS
- **Dark/Light Mode**: Tema adaptável
- **Formulários Validados**: React Hook Form + Zod
- **Toast Notifications**: Sonner para feedback visual
- **Middleware de Auth**: Proteção automática de rotas
- **TypeScript**: Type safety completo

---

## 🌐 Demonstração

### Produção

- **Frontend**: [https://altaa.gabrielfeijo.com.br](https://altaa.gabrielfeijo.com.br)

### Desenvolvimento Local

- **Frontend**: [http://localhost:3000](http://localhost:3000)

### 👥 Credenciais de Teste

```
Email: owner@altaa.ai
Senha: desafio@altaa

Email: admin@altaa.ai
Senha: desafio@altaa

Email: member@altaa.ai
Senha: desafio@altaa
```

---

## 🚀 Instalação

### Pré-requisitos

- Node.js 20 ou superior
- npm ou yarn
- Backend rodando (ver [README do backend](../backend/README.md))

### Método 1: Docker (Recomendado)

```bash
# Na raiz do projeto
docker-compose up -d frontend

# Acessar http://localhost:3000
```

### Método 2: Instalação Manual

1. **Clone e instale dependências**

   ```bash
   https://github.com/GabrielFeijo/desafio-altaa.git
   cd altaa.ai/frontend
   npm install
   ```

2. **Configure variáveis de ambiente**

   ```bash
   cp .env.example .env.local
   ```

   Edite `.env.local`:

   ```env
   NEXT_PUBLIC_API_URL="http://localhost:3333"
   ```

3. **Inicie o servidor de desenvolvimento**

   ```bash
   npm run dev
   ```

4. **Acesse a aplicação**

   Abra [http://localhost:3000](http://localhost:3000) no navegador

---

## 🏗️ Arquitetura

### Estrutura de Diretórios

```
frontend/
├── src/
│   ├── app/                      # App Router (Next.js 15)
│   │   ├── (auth)/              # Rotas públicas
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (dashboard)/         # Rotas protegidas
│   │   │   ├── layout.tsx      # Layout com Sidebar
│   │   │   ├── dashboard/
│   │   │   ├── company/[id]/
│   │   │   └── profile/
│   │   ├── accept-invite/       # Aceitar convite
│   │   ├── layout.tsx           # Root layout
│   │   └── globals.css          # Estilos globais
│   │
│   ├── components/              # Componentes React
│   │   ├── ui/                 # shadcn/ui base
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   ├── layout/             # Layout components
│   │   │   ├── header.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── user-nav.tsx
│   │   ├── dashboard/          # Dashboard components
│   │   │   ├── stats-cards.tsx
│   │   │   └── companies-table.tsx
│   │   ├── company/            # Company components
│   │   │   ├── members-table.tsx
│   │   │   ├── invite-dialog.tsx
│   │   │   └── edit-company-dialog.tsx
│   │   ├── forms/              # Form components
│   │   │   ├── profile-form.tsx
│   │   │   └── password-form.tsx
│   │   └── skeleton/           # Loading states
│   │
│   ├── lib/                     # Utilitários
│   │   ├── actions/            # Server Actions
│   │   │   ├── auth.actions.ts
│   │   │   ├── company.actions.ts
│   │   │   ├── invite.actions.ts
│   │   │   └── user.actions.ts
│   │   └── utils.ts            # Helper functions
│   │
│   ├── services/               # API Client
│   │   ├── api.ts             # Axios instance
│   │   └── auth.service.ts    # Auth service
│   │
│   ├── contexts/               # React Contexts
│   │   └── sidebar-context.tsx
│   │
│   ├── types/                  # TypeScript types
│   │   └── index.ts
│   │
│   └── middleware.ts           # Next.js middleware (auth)
│
├── public/                      # Assets estáticos
├── components.json             # shadcn/ui config
├── tailwind.config.ts          # Tailwind config
├── next.config.ts              # Next.js config
├── tsconfig.json               # TypeScript config
├── Dockerfile
└── package.json
```

---

## 🎭 Páginas Principais

### Páginas Públicas

#### `/login` - Login

- Formulário de login com validação
- Redirecionamento automático se autenticado
- Toggle de visibilidade de senha
- Link para signup

#### `/signup` - Cadastro

- Formulário de cadastro com validação
- Confirmação de senha
- Criação automática de sessão após cadastro

#### `/accept-invite` - Aceitar Convite

- Validação de token
- Fluxo para novo usuário (cadastro + aceite)
- Fluxo para usuário existente (apenas aceite)
- Redirecionamento para empresa

### Páginas Protegidas

#### `/dashboard` - Dashboard Principal

- Estatísticas de empresas
- Tabela de empresas com paginação
- Seleção de empresa ativa
- Criação de nova empresa

#### `/company/[id]` - Detalhes da Empresa

- Informações da empresa
- Tabela de membros
- Gestão de convites (OWNER/ADMIN)
- Edição de empresa (OWNER/ADMIN)
- Remoção de membros (OWNER/ADMIN)
- Atualização de papéis (OWNER/ADMIN)

#### `/profile` - Perfil do Usuário

- Informações pessoais
- Edição de perfil
- Alteração de senha
- Lista de empresas

---

## 🧪 Testes

```bash
# Executar testes
npm run test

npm run test:watch
```

---

## 📦 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia dev server
npm run build            # Build para produção
npm start                # Inicia produção

# Testes
npm run test

```
