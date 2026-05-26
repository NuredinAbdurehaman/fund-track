# Git workflow

## Branches

| Branch | Vercel | Purpose |
|--------|--------|---------|
| `main` | Production | Stable releases |
| `develop` | Preview | Integration testing |
| `feature/*` | PR previews | Feature work |

## Flow

1. Start from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   ```

2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. Commit with [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` new feature
   - `fix:` bug fix
   - `chore:` tooling, deps
   - `docs:` documentation
   - `refactor:` code change without behavior change

4. Open a PR into `develop`. CI must pass (lint + build).

5. After review, merge to `develop`. Vercel deploys a preview.

6. When ready for production, merge `develop` → `main`. Vercel deploys production.

## Rules

- Do not commit `.env` or `.env.local` (secrets).
- Keep `main` deployable at all times.
- One logical change per commit when possible.
