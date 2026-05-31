<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# todo-web

## Package manager

Bun. Lockfile: `bun.lock`. Use `bun` not `npm`/`yarn`.

```bash
bun dev          # dev server (localhost:3000)
bun run build    # production build
bun run lint     # ESLint (eslint-config-next/core-web-vitals + typescript)
```

No test framework. No test files.

## Stack

| Concern | Choice |
|---|---|
| Framework | Next.js **16** App Router |
| UI | shadcn/ui (Radix Nova), Radix UI, Lucide icons |
| CSS | Tailwind CSS **v4** (@tailwindcss/postcss), tw-animate-css, `shadcn/tailwind.css` |
| State | Zustand 5 + `persist` middleware (localStorage) |
| Data | TanStack React Query **v5** |
| HTTP | Axios |
| Auth | Firebase Auth (email/password, IndexedDB persistence) |
| Types | TypeScript strict, `@/*` alias → project root |
| Font | Geist (Geist + Geist_Mono via next/font) |

## Project structure

```
types/          # OpenAPI type definitions (Todo, Category, Comment, User)
config/         # Firebase app + auth init
services/       # Axios CRUD objects (todos, categories, comments, users)
stores/         # Zustand auth store (persisted to localStorage)
hooks/          # TanStack Query v5 hooks with optimistic updates
utils/          # date, priority, color helpers
components/
  ui/           # shadcn UI primitives (installed via `bunx shadcn add`)
  todo/         # TodoCard, TodoDetail, CreateTodoForm, etc.
  category/     # CategoryCard, CategoryDetail, CreateCategoryForm
  providers.tsx # QueryClientProvider + AuthGuard + Sidebar layout
  auth-guard.tsx# Client-side route protection
  sidebar.tsx   # Dashboard nav sidebar
app/
  layout.tsx    # Root layout with Providers
  page.tsx      # Redirects to /todos
  login/        # Login form (Card + email/password)
  signup/       # Signup form
  todos/        # Main todo list
  categories/   # Category list
  search/       # Debounced search with priority filters
  todo/[id]/    # Todo detail/edit/comments
  category/[id]/# Category detail/edit
  about/        # Project about page
```

## Layout

Dashboard layout with left sidebar. Only renders on authenticated pages. Auth pages (login/signup) render full-screen. Sidebar provides nav (Todos, Categories, Search, About) + sign out.

## Data flow

```
Page → Hook (TanStack Query v5) → Service (Axios) → REST API (localhost:8080)

Auth: Firebase Auth → Zustand store (persist:localStorage) → Axios interceptor (Bearer token)
Client-side auth guard in providers.tsx. No middleware.ts.
```

## Commands

```bash
bun dev                        # dev server w/ Turbopack
bun run build                  # full production build
bunx shadcn add <component>    # install shadcn UI component
```

## Environment

No `.env*` files committed (`.gitignore` blocks them). Required vars in `.env.example`:
```
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## Gotchas

- **dueDate format**: Backend expects `LocalDateTime` format (`YYYY-MM-DDT00:00:00`). `<input type="date">` gives `YYYY-MM-DD` — must append `T00:00:00` before sending.
- **Category colors**: Backend stores Tailwind color names (e.g. `"amber"`, `"emerald"`). These are NOT valid CSS color names. Must use `resolveColor()` from `@/utils/color` to convert to hex before applying as `style={{ backgroundColor }}`.
- **Checkbox in TodoCard**: Card body is NOT wrapped in `<Link>`. Detail navigation is a standalone `Pencil` icon. Checkbox must not propagate clicks (covered by current implementation).
- **Firebase auth**: Use `getAuth()` not `initializeAuth()` — `getAuth()` enables IndexedDB persistence by default, which survives page refresh.

## API endpoints

Backend at `NEXT_PUBLIC_API_URL` (default `http://localhost:8080`). Auth required via Firebase Bearer token.

| Method | Path | Description |
|---|---|---|
| GET | /todos | List todos |
| POST | /todos | Create todo |
| GET | /todos/{id} | Todo detail + categories + comments |
| PATCH | /todos/{id} | Update todo |
| DELETE | /todos/{id} | Delete todo |
| GET | /todos/search/{query} | Search todos (query: completed, priority) |
| GET | /categories | List categories |
| POST | /categories | Create category |
| GET | /categories/with-todos | Categories with todos |
| GET | /categories/{id} | Category detail |
| PATCH | /categories/{id} | Update category |
| DELETE | /categories/{id} | Delete category |
| GET | /todos/{id}/comments | List comments |
| POST | /todos/{id}/comments | Add comment |
| POST | /users | Register user |
| GET | /users/me | Current user profile |
