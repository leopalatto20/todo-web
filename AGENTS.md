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

No test framework configured. No test files exist.

## Stack

| Concern | Choice |
|---|---|
| Framework | Next.js **16** App Router |
| UI | shadcn/ui (Radix Nova style), Radix UI primitives, Lucide icons |
| CSS | Tailwind CSS **v4** (@tailwindcss/postcss), tw-animate-css, `shadcn/tailwind.css` |
| State | Zustand 5 |
| Data | TanStack React Query 4 |
| HTTP | Axios |
| Auth/DB | Firebase (dep added, no env/config files yet) |
| Types | TypeScript strict, `@/*` alias → project root |
| Font | Geist (Geist + Geist_Mono via next/font) |

## Conventions

- `cn()` from `@/lib/utils` (clsx + tailwind-merge) for className merging
- shadcn components in `@/components/ui/`, installed via `shadcn` CLI
- Component props: `React.ComponentProps<"element"> & VariantProps<typeof variants>` pattern
- CSS imports in `app/globals.css`: `@import "tailwindcss"` (v4), no `@tailwind` directives
- Dark mode via `.dark` class on `<html>` (no next-themes installed yet)

## Firebase

`firebase` in dependencies but no `.env.*` files, no Firebase config, no `firebase/` lib files. Setting up auth/DB is future work — agent must create Firebase client config and `.env.local` vars.

## Environment

No `.env*` files committed (`.gitignore` blocks them). No `.env.example`. Any API keys / Firebase config must use `.env.local`.

## Known gaps (from repo state)

- No API routes in `app/api/`
- No middleware (`middleware.ts`)
- No server actions
- No hooks directory yet (despite `hooks: "@/hooks"` in components.json)
