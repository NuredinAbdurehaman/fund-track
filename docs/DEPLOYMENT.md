# Deployment guide — Supabase + Vercel

Fund Track uses **Supabase** (PostgreSQL + Auth) and **Vercel** for hosting. Each user has isolated transactions; balances are computed from the transaction log.

## Prerequisites

- [Supabase](https://supabase.com) account
- [Vercel](https://vercel.com) account
- [GitHub](https://github.com) repository for this project
- Node.js 20+ locally

---

## 1. Supabase project

### Create project

1. New project at [supabase.com/dashboard](https://supabase.com/dashboard)
2. Save the database password

### Database connection strings

Project **Settings** → **Database**:

| Variable | Source |
|----------|--------|
| `DATABASE_URL` | **Connection string** → **Transaction pooler** (port 6543). Append `?pgbouncer=true` if missing. |
| `DIRECT_URL` | **Session pooler** or **Direct connection** (port 5432) — used for migrations only |

### Auth

1. **Authentication** → **Providers** → enable **Email**
2. **Authentication** → **URL configuration**:
   - **Site URL:** `https://your-app.vercel.app` (update after first Vercel deploy)
   - **Redirect URLs:**
     - `http://localhost:3000/**`
     - `https://your-app.vercel.app/**`

### API keys

**Settings** → **API**:

| Variable | Key |
|----------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` `public` key |

---

## 2. Local setup

```bash
cp .env.example .env.local
```

Fill `.env.local` with Supabase values. For full stack locally:

```env
NEXT_PUBLIC_USE_API=true
```

```bash
npm install
npx prisma migrate dev
npm run dev
```

1. Open [http://localhost:3000/login](http://localhost:3000/login) → create account
2. Add a transaction on the ledger
3. Supabase **Table Editor** → `transactions` → confirm row has your `user_id`

### Row Level Security (optional, recommended)

In Supabase **SQL Editor**, run [`docs/rls.sql`](./rls.sql).

---

## 3. GitHub

1. Push the repo to GitHub
2. **Settings** → **Actions** → allow workflows
3. CI runs on push/PR to `main` and `develop` (see [`.github/workflows/ci.yml`](../.github/workflows/ci.yml))

See [`docs/GIT_WORKFLOW.md`](./GIT_WORKFLOW.md) for branch strategy.

---

## 4. Vercel

1. [vercel.com/new](https://vercel.com/new) → Import GitHub repo
2. **Production branch:** `main`
3. **Environment variables** (Production and Preview):

| Name | Value |
|------|--------|
| `DATABASE_URL` | Supabase transaction pooler URI |
| `DIRECT_URL` | Supabase direct/session URI |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `NEXT_PUBLIC_USE_API` | `true` |

4. Deploy. Build runs `prisma migrate deploy` then `next build` (see [`vercel.json`](../vercel.json)).

5. Update Supabase **Site URL** and **Redirect URLs** with your real Vercel domain.

---

## 5. Post-deploy checklist

- [ ] `/` redirects to `/login` when signed out
- [ ] Sign up and sign in work
- [ ] Sign out works
- [ ] Transactions persist after refresh
- [ ] Second user cannot see first user's data
- [ ] My Account total updates per user
- [ ] `transactions` table in Supabase has correct `user_id`

---

## 6. Troubleshooting

| Issue | Fix |
|-------|-----|
| `401` on API | Session cookie missing — ensure `credentials: "include"` on fetches; check middleware and Supabase redirect URLs |
| Auth redirect loop | Site URL / Redirect URLs must match Vercel domain exactly |
| `P1001` connection error | Wrong `DATABASE_URL`; use pooler + `pgbouncer=true` |
| Migration fails on Vercel | Set `DIRECT_URL`; migrations use direct connection |
| Prisma / RLS conflict | Prisma uses service DB URL; app filters by `userId`. RLS is extra protection |
| Empty ledger in prod | Set `NEXT_PUBLIC_USE_API=true`; check Vercel function logs for API errors |

---

## 7. Local dev without Supabase

Leave `NEXT_PUBLIC_SUPABASE_URL` unset and `NEXT_PUBLIC_USE_API=false`:

- Auth middleware is skipped
- Data uses `localStorage` only
- Useful for UI work without a database
