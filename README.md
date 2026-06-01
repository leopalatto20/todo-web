# todo-web

Web client for the todo-list REST API. Built with Next.js 16, shadcn/ui, Tailwind CSS v4, TanStack Query, Zustand, and Firebase Auth.

## Prerequisites

- [Bun](https://bun.sh) >= 1.2
- Backend server running on `localhost:8080` (Quarkus)
- Firebase project with **Email/Password** sign-in enabled

## Tech stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 App Router |
| UI | shadcn/ui (Radix Nova), Radix UI, Lucide icons |
| CSS | Tailwind CSS v4, tw-animate-css |
| State | Zustand 5 + persist (localStorage) |
| Data | TanStack React Query v5 |
| HTTP | Axios |
| Auth | Firebase Auth (email/password) |
| Font | Geist (Geist + Geist_Mono) |

## Setup

```bash
bun install
```

Copy `.env.example` to `.env.local` and fill in your Firebase project credentials:

```bash
cp .env.example .env.local
```

Required vars:

```
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

## Development

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

| Command | Description |
|---|---|
| `bun dev` | Start dev server (Turbopack) |
| `bun run build` | Production build |
| `bun run lint` | Run ESLint |
| `bunx shadcn add <component>` | Install a shadcn UI component |

## Project structure

```
types/          OpenAPI type definitions
config/         Firebase app + auth init
services/       Axios CRUD objects
stores/         Zustand auth store (localStorage)
hooks/          TanStack Query v5 hooks
utils/          Date, priority, color helpers
components/
  ui/           shadcn UI primitives
  todo/         TodoCard, TodoDetail, CreateTodoForm
  category/     CategoryCard, CategoryDetail, CreateCategoryForm
  sidebar.tsx   Dashboard sidebar navigation
  auth-guard.tsx  Client-side route protection
  providers.tsx   QueryClient + AuthGuard + layout
app/            Next.js App Router pages
```

## Architecture

```
Page → Hook (TanStack Query v5) → Service (Axios) → REST API (localhost:8080)

Auth: Firebase Auth → Zustand store → Axios interceptor (Bearer token)
```
## Deployed URL

Frontend deployed at [todo-web](https://todo-web-alpha-seven.vercel.app).
