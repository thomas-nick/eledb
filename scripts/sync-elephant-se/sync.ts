#!/usr/bin/env npx tsx
/**
 * Sync elephant.se records into Hostinger MySQL (+ local seed JSON fallback).
 *
 * Usage:
 *   npm run sync:init       # create MySQL elephants table
 *   npm run sync:migrate    # add new columns to existing table
 *   npm run sync:elephants  # RSS feed records
 *   npm run sync:thailand   # all Thailand locations
 *   npm run sync:all        # worldwide Asian elephant ID crawl (resumable)
 */
import { config } from "dotenv";
import { writeFileSync } from "fs";
import { resolve } from "path";
import { XMLParser } from "fast-xml-parser";
import {
  initElephantSchema,
  isMysqlConfigured,
  migrateElephantSchema,
  upsertElephants,
} from "../../src/lib/elephant-db";
import { migrateEnrichmentSchema } from "../../src/lib/elephant-enrichment-db";
import { migrateContributionSchema } from "../../src/lib/contribution-db";
import { migrateCampSchema } from "../../src/lib/camp-db";
import type { ElephantRecord } from "../../src/types/elephant";
import { runWorldwideCrawl } from "./crawl";
import { failIfNoSync } from "./assert-sync";
import { discoverThailandElephantIds, fetchText } from "./discover";
import {
  extractElephantIdsFromHtml,
  parseElephantPage,
  parseRssDescription,
} from "./parse";
import {
  locationPageUrl,
  RSS_URL,
  sleep,
  SyncElephantRecord,
  elephantPageUrl,
  normalizeCategory,
  THAILAND_COUNTRY,
} from "./types";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env.production") });
config({ path: resolve(process.cwd(), ".env") });

const REQUEST_DELAY_MS = Number(process.env.SYNC_DELAY_MS ?? 2000);
const MAX_RECORDS = Number(process.env.SYNC_MAX_RECORDS ?? 200);
const THAILAND_MAX_RECORDS = Number(process.env.SYNC_THAILAND_MAX_RECORDS ?? 0);
const THAILAND_MAX_LOCATIONS = Number(process.env.SYNC_THAILAND_MAX_LOCATIONS ?? 0);
const BATCH_SIZE = Number(process.env.SYNC_BATCH_SIZE ?? 50);

const SEED_LOCATION_IDS = [
  "1758",
  "2665",
  "248",
  "1003",
  "1198",
  "1103",
  "4113",
];

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

async function fetchRssIds(): Promise<Map<string, Partial<SyncElephantRecord>>> {
  const xml = await fetchText(RSS_URL);
  const parser = new XMLParser({ ignoreAttributes: false });
  const parsed = parser.parse(xml);
  const items = parsed?.rss?.channel?.item ?? [];
  const list = Array.isArray(items) ? items : [items];
  const map = new Map<string, Partial<SyncElephantRecord>>();

  for (const item of list) {
    const link: string = item.link ?? "";
    const id = link.match(/elephant_id=(\d+)/)?.[1];
    if (!id) continue;
    const title: string = item.title ?? "";
    const name = title.split(",")[0]?.replace(/^EM\s+/i, "").trim() || "unknown";
    const partial = parseRssDescription(item.description ?? "", id);
    map.set(id, {
      ...partial,
      name,
      species: "asian",
      sex: "unknown",
      category: normalizeCategory(item.category),
      sourceUrl: elephantPageUrl(id),
    });
  }
  return map;
}

async function fetchElephant(id: string, rssHint?: Partial<SyncElephantRecord>) {
  await sleep(REQUEST_DELAY_MS);
  const html = await fetchText(elephantPageUrl(id));
  const parsed = parseElephantPage(html, id);
  if (!parsed) return null;
  return {
    ...rssHint,
    ...parsed,
    id,
    status: parsed.status,
    birthDate: parsed.birthDate ?? rssHint?.birthDate,
  } as SyncElephantRecord;
}

async function flushBatch(batch: ElephantRecord[], mysql: boolean) {
  if (batch.length === 0) return;
  if (mysql) await upsertElephants(batch);
  batch.length = 0;
}

async function collectSeedIds(full: boolean): Promise<string[]> {
  const rss = await fetchRssIds();
  const ids = new Set<string>([...rss.keys()]);

  if (full) {
    for (const locationId of SEED_LOCATION_IDS) {
      console.log(`Crawling location ${locationId}...`);
      await sleep(REQUEST_DELAY_MS);
      const html = await fetchText(locationPageUrl(locationId));
      for (const id of extractElephantIdsFromHtml(html)) ids.add(id);
    }
  }

  return [...ids].slice(0, MAX_RECORDS);
}

async function collectThailandIds(): Promise<string[]> {
  const { elephantIds, locationIds } = await discoverThailandElephantIds({
    delayMs: REQUEST_DELAY_MS,
    maxLocations: THAILAND_MAX_LOCATIONS,
    onLocation: (current, total, locationId) => {
      process.stdout.write(
        `\rCrawling Thailand locations ${current}/${total} (${locationId})...`
      );
    },
  });
  console.log(
    `\nDiscovered ${elephantIds.length} unique elephants across ${locationIds.length} locations`
  );

  if (THAILAND_MAX_RECORDS > 0) {
    return elephantIds.slice(0, THAILAND_MAX_RECORDS);
  }
  return elephantIds;
}

async function runSync() {
  const thailand = hasFlag("--thailand");
  const full = hasFlag("--full");
  const rss = await fetchRssIds();

  const ids = thailand
    ? await collectThailandIds()
    : await collectSeedIds(full);

  const countryFilter = thailand ? THAILAND_COUNTRY : null;
  const mysql = isMysqlConfigured();
  console.log(`Syncing ${ids.length} elephant records...`);

  const records: ElephantRecord[] = [];
  const batch: ElephantRecord[] = [];
  let skipped = 0;

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    if (thailand && (i + 1) % 25 === 0) {
      process.stdout.write(`\rParsing elephants ${i + 1}/${ids.length}...`);
    }
    try {
      const record = await fetchElephant(id, rss.get(id));
      if (!record) {
        skipped++;
        continue;
      }
      if (countryFilter && record.country !== countryFilter) {
        skipped++;
        continue;
      }
      records.push(record);
      if (mysql) {
        batch.push(record);
        if (batch.length >= BATCH_SIZE) await flushBatch(batch, true);
      }
      if (!thailand) process.stdout.write(".");
    } catch (err) {
      console.warn(`\nSkip ${id}:`, err);
    }
  }

  if (mysql) await flushBatch(batch, true);

  if (thailand) console.log("");
  console.log(
    `Parsed ${records.length} records` +
      (skipped ? ` (${skipped} skipped)` : "")
  );

  const outPath = resolve(process.cwd(), "src/data/elephantsSeed.json");
  writeFileSync(outPath, JSON.stringify(records.slice(0, 100), null, 2));
  console.log(`Wrote seed fallback → ${outPath}`);

  if (mysql && !thailand) {
    await upsertElephants(records);
    console.log(`MySQL updated (${records.length} rows upserted)`);
  } else if (mysql && thailand) {
    console.log(`MySQL updated (${records.length} rows upserted in batches)`);
  } else {
    console.log("MySQL not configured — seed file only (set MYSQL_* in .env.local)");
  }

  if (mysql) {
    failIfNoSync(records.length, ids.length, "RSS/seed sync");
  }
}

async function runInit() {
  if (!isMysqlConfigured()) {
    throw new Error("Set MYSQL_HOST, MYSQL_USER, MYSQL_DATABASE (and password) in .env.local");
  }
  await initElephantSchema();
  await migrateEnrichmentSchema();
  await migrateContributionSchema();
  await migrateCampSchema();
  console.log("MySQL elephants + enrichments + contributions + camps tables ready");
}

async function runMigrate() {
  if (!isMysqlConfigured()) {
    throw new Error("Set MYSQL_HOST, MYSQL_USER, MYSQL_DATABASE (and password) in .env.local");
  }
  await migrateElephantSchema();
  await migrateEnrichmentSchema();
  await migrateContributionSchema();
  await migrateCampSchema();
  console.log("MySQL schema migration complete");
}

async function runAll() {
  if (!isMysqlConfigured()) {
    throw new Error("Set MYSQL_HOST, MYSQL_USER, MYSQL_DATABASE (and password) in .env.local");
  }
  await migrateElephantSchema();
  const result = await runWorldwideCrawl({
    delayMs: REQUEST_DELAY_MS,
    reset: hasFlag("--reset"),
  });
  failIfNoSync(result.syncedThisRun, result.idsTriedThisRun, "Worldwide crawl");
}

function onSyncError(err: unknown) {
  console.error(err);
  process.exit(1);
}

const cmd = process.argv[2];
if (cmd === "init") {
  runInit().catch(onSyncError);
} else if (cmd === "migrate") {
  runMigrate().catch(onSyncError);
} else if (hasFlag("--all")) {
  runAll().catch(onSyncError);
} else {
  runSync().catch(onSyncError);
}
