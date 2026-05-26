# Fund Track

Personal finance ledger — balances are **always derived from transactions**, never stored separately.

## Stack

- Next.js (App Router) + TypeScript + Tailwind + shadcn/ui
- Supabase (PostgreSQL + Auth)
- Prisma ORM
- Vercel deployment

## Getting started (local)

```bash
npm install
cp .env.example .env.local
# Fill Supabase + DB URLs; set NEXT_PUBLIC_USE_API=true for API mode
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Without Supabase:** omit auth env vars and set `NEXT_PUBLIC_USE_API=false` to use `localStorage` only.

## Architecture

- **Source of truth:** `Transaction[]` per authenticated user
- **Categories:** derived from transactions
- **My Account:** virtual total = sum(adds) − sum(withdraws) across all categories
- **Balances:** computed on read, never stored

## Deploy

See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** for Supabase + Vercel setup.

See **[docs/GIT_WORKFLOW.md](docs/GIT_WORKFLOW.md)** for branch and PR workflow.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run db:migrate` | Create/apply migrations (local) |
| `npm run db:migrate:deploy` | Apply migrations (CI/production) |

## Git branches

| Branch | Purpose |
|--------|---------|
| `main` | Production (Vercel) |
| `develop` | Integration / preview |
| `feature/*` | Features |

Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`
