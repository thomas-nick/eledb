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

`.github/workflows/sync-elephants.yml` is **manual-only** (workflow_dispatch). GitHub’s cloud runners are often blocked or rate-limited by elephant.se — use Hostinger cron instead.

### Repository secrets (optional fallback)

Settings → Secrets and variables → Actions — only needed if you run the manual GitHub workflow.

| Secret | Example |
|--------|---------|
| `MYSQL_HOST` | `srv1529.hstgr.io` |
| `MYSQL_PORT` | `3306` |
| `MYSQL_DATABASE` | `u196551923_eleph` |
| `MYSQL_USER` | `u196551923_asianele` |
| `MYSQL_PASSWORD` | *(from hPanel)* |

## Hostinger cron (recommended)

Run sync **on the server** where MySQL is local and elephant.se is reachable.

1. **SSH** into Hostinger (`hPanel` → Advanced → SSH Access).
2. Find your Node app root (`hPanel` → Websites → mahoot.xyz → **Node.js** → application root). Often:
   `~/domains/mahoot.xyz` or a `nodejs` subdirectory.
3. Ensure `.env.production` exists in that directory (bundled with deploy).
4. Create a log directory:
   ```bash
   mkdir -p ~/logs
   ```
5. Make the cron script executable (after deploy):
   ```bash
   chmod +x ~/domains/mahoot.xyz/scripts/hostinger-cron.sh
   ```
6. Edit crontab:
   ```bash
   crontab -e
   ```
   Add:
   ```cron
   # Quick RSS refresh — Sundays 04:00 UTC
   0 4 * * 0 MAHOOT_APP_DIR=$HOME/domains/mahoot.xyz $HOME/domains/mahoot.xyz/scripts/hostinger-cron.sh quick >> $HOME/logs/mahoot-sync.log 2>&1

   # Full ID crawl — first Sunday of month 05:00 UTC (resumable, up to 6h)
   0 5 1-7 * 0 MAHOOT_APP_DIR=$HOME/domains/mahoot.xyz $HOME/domains/mahoot.xyz/scripts/hostinger-cron.sh full >> $HOME/logs/mahoot-sync.log 2>&1
   ```
   Adjust `MAHOOT_APP_DIR` if your Node root differs.

7. **Test manually once:**
   ```bash
   MAHOOT_APP_DIR=$HOME/domains/mahoot.xyz $HOME/domains/mahoot.xyz/scripts/hostinger-cron.sh quick
   ```
   Expect `RSS/seed sync: imported N record(s)` and a non-zero exit if elephant.se is unreachable.

### npm shortcuts

| Command | Use |
|---------|-----|
| `npm run sync:cron` | migrate + quick RSS sync (same as cron `quick`) |
| `npm run sync:elephants` | RSS + seed locations only |
| `npm run sync:all` | Full worldwide ID crawl (resumable) |

Sync scripts **exit with code 1** if MySQL is configured but zero records were imported (after ≥10 attempts).

## Weekly GitHub Action (legacy)

Actions → **Sync elephant.se → MySQL** → Run workflow. Choose **quick** (RSS) or **full** (worldwide crawl). Prefer Hostinger cron for production.

## Local dev

Without `.env.local`, `/elephants` uses `src/data/elephantsSeed.json` automatically.
