# Fund Track

Personal finance ledger — balances are **always derived from transactions**, never stored separately.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Phase 1–2: React state + `localStorage`
- Phase 3: Prisma + PostgreSQL API (optional via env)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Architecture

- **Source of truth:** `Transaction[]`
- **Categories:** derived from transaction history
- **Balances:** `sum(adds) - sum(withdraws)` per category (computed on read)

## Git workflow

| Branch | Purpose |
|--------|---------|
| `main` | Production stable |
| `develop` | Active integration |
| `feature/*` | Feature work |

Conventional commits: `chore:`, `feat:`, `fix:`, `refactor:`, `docs:`

## PostgreSQL (Phase 3)

1. Copy `.env.example` to `.env` and set `DATABASE_URL`
2. Run `npm run db:push` (or `npm run db:migrate`)
3. Set `NEXT_PUBLIC_USE_API=true`
4. Restart the dev server

Without a database, the app uses `localStorage` automatically.
