# Typesense setup for mahoot

mahoot uses [Typesense Cloud](https://cloud.typesense.org) for fast, typo-tolerant elephant search (~15k records). MySQL remains the source of truth; Typesense is a search index synced after each elephant.se pull.

## 1. Create a Typesense Cloud cluster

1. Sign up at [cloud.typesense.org](https://cloud.typesense.org)
2. Create a cluster (starter tier is sufficient for ~15k docs)
3. Note the **Host** (e.g. `xxx.a1.typesense.net`), **Admin API key**, and **Search-only API key**

Collections are created automatically by `npm run typesense:init` — you do not need to define them manually in the Cloud UI.

## 2. Add environment variables

### Server (required for search)

Add to hPanel (or `.env.production`):

```env
TYPESENSE_HOST=xxx.a1.typesense.net
TYPESENSE_PORT=443
TYPESENSE_PROTOCOL=https
TYPESENSE_API_KEY=your-admin-api-key
```

### Client instant search (optional, recommended)

The Cmd+K palette and homepage typeahead can query Typesense directly from the browser using the **search-only** key (read-only — safe to expose):

```env
NEXT_PUBLIC_TYPESENSE_HOST=xxx.a1.typesense.net
NEXT_PUBLIC_TYPESENSE_PORT=443
NEXT_PUBLIC_TYPESENSE_PROTOCOL=https
NEXT_PUBLIC_TYPESENSE_SEARCH_KEY=your-search-only-key
```

Add the same `NEXT_PUBLIC_*` vars to `.env.local` for local dev. Without them, typeahead falls back to `/api/search` (still fast, one extra server hop).

**Never** expose `TYPESENSE_API_KEY` in the browser.

## 3. Initial index build

After deploying code with Typesense env vars set:

```bash
npm run typesense:init          # create collections + synonyms
npm run typesense:sync -- full  # bulk import from MySQL
```

When the schema changes (new fields like `popularity_score`), recreate and reindex:

```bash
npm run typesense:sync -- recreate
```

On Hostinger (SSH or cron app dir):

```bash
cd $HOME/domains/mahoot.xyz
source .env.production
npm run typesense:sync -- recreate   # first time after schema upgrade
npm run typesense:sync -- full        # thereafter
```

## 4. Ongoing sync

The Hostinger cron script (`scripts/hostinger-cron.sh`) runs Typesense sync after elephant.se sync when `TYPESENSE_*` is configured:

- **quick** (weekly RSS): incremental upsert (last 7 days of changes)
- **full** (monthly crawl): full reindex

Local equivalent: `npm run sync:cron` (includes `typesense:sync`).

## 5. Verify

Server search:

```bash
curl 'https://mahoot.xyz/api/elephants/search?q=elephant+nature&perPage=1'
```

Federated typeahead:

```bash
curl 'https://mahoot.xyz/api/search?q=lakshmi&limit=3'
```

Response should include `"source":"typesense"` and typo-tolerant matches (e.g. `elefant nature` → Elephant Nature Park).

## Collections

| Collection   | Purpose                          | Docs   |
|-------------|-----------------------------------|--------|
| `elephants` | Main search on `/elephants`       | ~15k   |
| `locations` | Camp/facility typeahead             | ~hundreds |

Schema definitions live in [`src/lib/typesense.ts`](../src/lib/typesense.ts).

### Ranking fields (elephants)

| Field              | Purpose                                      |
|--------------------|----------------------------------------------|
| `popularity_score` | Boost living, named, enriched, photographed records |
| `has_photo`        | Facet + popularity input                     |
| `has_enrichment`   | Sanctuary story linked                       |

Synonyms (ENP, elefant, camp/sanctuary, etc.) are applied on init — see [`src/lib/typesense-synonyms.ts`](../src/lib/typesense-synonyms.ts).

## Fallback behavior

If Typesense is unavailable or not configured, search falls back to MySQL (`source: mysql`), then local seed JSON (`source: local`). Browser typeahead falls back to `/api/search`.
