#!/usr/bin/env bash
# Weekly elephant.se → MySQL sync for Hostinger (run via cron on the server).
#
# Setup once on SSH:
#   chmod +x scripts/hostinger-cron.sh
#   crontab -e
#   # Quick RSS refresh — Sundays 04:00 UTC (~15–30 min):
#   0 4 * * 0  MAHOOT_APP_DIR=$HOME/domains/mahoot.xyz $HOME/domains/mahoot.xyz/scripts/hostinger-cron.sh quick >> $HOME/logs/mahoot-sync.log 2>&1
#   # Full ID crawl — 1st Sunday of month 05:00 UTC (up to 6h, resumable):
#   0 5 1-7 * 0  MAHOOT_APP_DIR=$HOME/domains/mahoot.xyz $HOME/domains/mahoot.xyz/scripts/hostinger-cron.sh full >> $HOME/logs/mahoot-sync.log 2>&1
#
# Find your app directory in hPanel → Node.js → mahoot.xyz → Application root.

set -euo pipefail

MODE="${1:-quick}"
APP_DIR="${MAHOOT_APP_DIR:-$HOME/domains/mahoot.xyz}"
LOG_PREFIX="[mahoot-sync $(date -u +%Y-%m-%dT%H:%M:%SZ)]"

if [[ ! -d "$APP_DIR" ]]; then
  echo "$LOG_PREFIX ERROR: app directory not found: $APP_DIR"
  echo "Set MAHOOT_APP_DIR to your Hostinger Node.js application root."
  exit 1
fi

cd "$APP_DIR"

# Hostinger Node often exposes node via nvm or a fixed path
if [[ -f "$HOME/.nvm/nvm.sh" ]]; then
  # shellcheck disable=SC1091
  source "$HOME/.nvm/nvm.sh"
fi

export PATH="$PATH:$HOME/.nvm/versions/node/$(ls "$HOME/.nvm/versions/node" 2>/dev/null | tail -1)/bin"

echo "$LOG_PREFIX starting ($MODE) in $APP_DIR"

# Load production MySQL + env (bundled with deploy)
if [[ -f .env.production ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env.production
  set +a
elif [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
else
  echo "$LOG_PREFIX ERROR: no .env.production or .env found"
  exit 1
fi

export SYNC_DELAY_MS="${SYNC_DELAY_MS:-3000}"

npm run sync:migrate

case "$MODE" in
  quick)
    npm run sync:elephants
    if [[ -n "${TYPESENSE_HOST:-}" && -n "${TYPESENSE_API_KEY:-}" ]]; then
      npm run typesense:sync
    else
      echo "$LOG_PREFIX skipping Typesense sync (TYPESENSE_* not set)"
    fi
    ;;
  full)
    export SYNC_MAX_RUNTIME_MS="${SYNC_MAX_RUNTIME_MS:-21600000}"
    npm run sync:all
    if [[ -n "${TYPESENSE_HOST:-}" && -n "${TYPESENSE_API_KEY:-}" ]]; then
      npm run typesense:sync -- full
    else
      echo "$LOG_PREFIX skipping Typesense sync (TYPESENSE_* not set)"
    fi
    ;;
  *)
    echo "$LOG_PREFIX ERROR: unknown mode '$MODE' (use quick or full)"
    exit 1
    ;;
esac

echo "$LOG_PREFIX finished ($MODE)"
