#!/usr/bin/env bash
# Build a Hostinger deploy archive from git HEAD plus local .env.production.
# Usage: ./scripts/deploy-hostinger.sh [/tmp/mahoot-deploy.zip]
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${1:-/tmp/mahoot-deploy.zip}"
cd "$ROOT"

git archive --format=zip -o "$OUT" HEAD

if [[ -f .env.production ]]; then
  zip -j "$OUT" .env.production
  echo "Included .env.production in archive"
else
  echo "WARNING: .env.production not found — production will fall back to seed JSON (100 records)"
  echo "Copy .env.example to .env.production and fill in MYSQL_* before deploying."
fi

echo "Deploy archive: $OUT ($(ls -lh "$OUT" | awk '{print $5}'))"
