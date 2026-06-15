# MySQL on mahoot.xyz

Elephant records sync into your existing Hostinger Business MySQL database.

## Setup

1. **hPanel** → Websites → mahoot.xyz → **Databases**
2. Note host, database name, user, password
3. Copy `.env.example` → `.env.local` and fill in `MYSQL_*`
4. **Remote MySQL** (for GitHub Actions / local dev):
   - hPanel → Remote MySQL → allow your dev machine IP
   - For GitHub Actions: allow `%` (any host) or add [GitHub Actions IP ranges](https://api.github.com/meta) under `actions`
5. Initialize + migrate:
   ```bash
   npm run sync:init
   npm run sync:migrate
   ```
6. Worldwide Asian elephant catalog (~6–8 hours, resumable):
   ```bash
   npm run sync:all
   ```
   Resume after interruption automatically via `scripts/sync-elephant-se/.checkpoint.json`.
   Start fresh: `npm run sync:all -- --reset`

## Weekly GitHub Action

`.github/workflows/sync-elephants.yml` runs every **Sunday 03:00 UTC** (and on manual dispatch).

It migrates schema, then runs the worldwide crawl for up to ~5.5 hours per run. A cached checkpoint lets each weekly run **resume** until the full ID range is done, then **auto-restarts** a fresh refresh on the next run.

### Repository secrets

Settings → Secrets and variables → Actions:

| Secret | Example |
|--------|---------|
| `MYSQL_HOST` | `srv1529.hstgr.io` |
| `MYSQL_PORT` | `3306` |
| `MYSQL_DATABASE` | `u196551923_eleph` |
| `MYSQL_USER` | `u196551923_asianele` |
| `MYSQL_PASSWORD` | *(from hPanel)* |

### Manual run

Actions → **Sync elephant.se → MySQL** → Run workflow. Check **Reset checkpoint** to start from ID 1.

## Local dev

Without `.env.local`, `/elephants` uses `src/data/elephantsSeed.json` automatically.
