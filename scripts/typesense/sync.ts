#!/usr/bin/env npx tsx
/**
 * Sync MySQL elephant + location data into Typesense.
 *
 * Usage:
 *   npm run typesense:init        # create collections (idempotent)
 *   npm run typesense:sync        # incremental upsert (default)
 *   npm run typesense:sync -- full  # full reindex from MySQL
 */
import { config } from "dotenv";
import { resolve } from "path";
import { getMysqlPool, isMysqlConfigured } from "../../src/lib/elephant-db";
import {
  elephantsCollectionSchema,
  getTypesenseClient,
  isTypesenseConfigured,
  locationsCollectionSchema,
  LOCATIONS_COLLECTION,
  ELEPHANTS_COLLECTION,
} from "../../src/lib/typesense";
import {
  recordToTypesenseDoc,
  type TypesenseElephantDoc,
} from "../../src/lib/typesense-elephants";
import type { ElephantRecord } from "../../src/types/elephant";
import { normalizeLocationDisplayName } from "../../src/lib/locationDisplay";
import { upsertTypesenseSynonyms } from "../../src/lib/typesense-synonyms";
import type { RowDataPacket } from "mysql2/promise";

config({ path: resolve(process.cwd(), ".env.production") });
config({ path: resolve(process.cwd(), ".env.local") });

const BATCH_SIZE = 500;

interface ElephantRow extends RowDataPacket {
  id: string;
  name: string;
  sex: ElephantRecord["sex"];
  status: ElephantRecord["status"];
  subspecies: ElephantRecord["subspecies"];
  birth_date: string | null;
  age_years: number | null;
  location_id: string | null;
  location_name: string;
  country: string;
  category: ElephantRecord["category"];
  chip_id: string | null;
  father_name: string | null;
  mother_name: string | null;
  source_url: string;
  synced_at: Date | string;
  has_enrichment: number;
  has_photo: number;
  photos: unknown;
}

interface LocationRow extends RowDataPacket {
  location_id: string;
  location_name: string;
  country: string;
  category: string;
  elephant_count: number;
  living_count: number;
  named_count: number;
}

function formatDate(value: string | null): string | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toISOString().slice(0, 10);
}

function rowToRecord(row: ElephantRow): ElephantRecord {
  return {
    id: row.id,
    name: row.name,
    sex: row.sex,
    status: row.status,
    species: "asian",
    subspecies: row.subspecies ?? "unknown",
    birthDate: formatDate(row.birth_date),
    ageYears: row.age_years ?? undefined,
    locationId: row.location_id ?? undefined,
    locationName: row.location_name,
    country: row.country,
    category: row.category,
    chipId: row.chip_id ?? undefined,
    fatherName: row.father_name ?? undefined,
    motherName: row.mother_name ?? undefined,
    sourceUrl: row.source_url,
    syncedAt:
      row.synced_at instanceof Date
        ? row.synced_at.toISOString()
        : new Date(row.synced_at).toISOString(),
  };
}

function isNamed(name: string): boolean {
  const n = name.trim().toLowerCase();
  return n !== "" && n !== "unknown" && n !== "unnamed";
}

async function ensureCollection(
  schema: typeof elephantsCollectionSchema,
  recreate = false
): Promise<void> {
  const client = getTypesenseClient();
  try {
    if (recreate) {
      try {
        await client.collections(schema.name).delete();
        console.log(`Dropped collection "${schema.name}"`);
      } catch {
        // collection may not exist
      }
    } else {
      await client.collections(schema.name).retrieve();
      console.log(`Collection "${schema.name}" already exists`);
      return;
    }
  } catch {
    // collection missing — create below
  }

  await client.collections().create(schema);
  console.log(`Created collection "${schema.name}"`);
}

async function fetchElephantRows(since?: Date): Promise<ElephantRow[]> {
  const db = getMysqlPool();
  const sinceClause = since ? "AND e.synced_at >= ?" : "";
  const params = since ? [since] : [];

  const [rows] = await db.query<ElephantRow[]>(
    `SELECT e.*,
            EXISTS(
              SELECT 1 FROM elephant_enrichments en WHERE en.elephant_id = e.id
            ) AS has_enrichment,
            (
              (e.photos IS NOT NULL AND JSON_LENGTH(e.photos) > 0)
              OR EXISTS(
                SELECT 1 FROM elephant_enrichments en
                WHERE en.elephant_id = e.id
                  AND en.photos IS NOT NULL
                  AND JSON_LENGTH(en.photos) > 0
              )
              OR EXISTS(
                SELECT 1 FROM community_photos cp WHERE cp.elephant_id = e.id
              )
            ) AS has_photo
     FROM elephants e
     WHERE 1=1 ${sinceClause}
     ORDER BY e.id`,
    params
  );

  return rows;
}

async function importElephants(docs: TypesenseElephantDoc[]): Promise<void> {
  if (!docs.length) return;
  const client = getTypesenseClient();

  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, i + BATCH_SIZE);
    const result = await client
      .collections(ELEPHANTS_COLLECTION)
      .documents()
      .import(batch, { action: "upsert" });

    const lines = Array.isArray(result)
      ? result
      : String(result).trim().split("\n").filter(Boolean);
    const failures = lines.filter((line) => {
      const row = typeof line === "string" ? JSON.parse(line) : line;
      return !row.success;
    });
    if (failures.length) {
      console.warn(`Elephant import batch ${i / BATCH_SIZE + 1}: ${failures.length} failures`);
      console.warn(failures.slice(0, 3).join("\n"));
    } else {
      console.log(`Imported elephants ${i + 1}–${i + batch.length}`);
    }
  }
}

async function syncElephants(mode: "full" | "incremental"): Promise<number> {
  const since =
    mode === "incremental"
      ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      : undefined;

  const rows = await fetchElephantRows(since);
  const docs = rows.map((row) => {
    const record = rowToRecord(row);
    return recordToTypesenseDoc(record, {
      isNamed: isNamed(record.name),
      hasEnrichment: Boolean(row.has_enrichment),
      hasPhoto: Boolean(row.has_photo),
    });
  });

  await importElephants(docs);
  return docs.length;
}

async function syncLocations(): Promise<number> {
  const db = getMysqlPool();
  const [rows] = await db.query<LocationRow[]>(
    `SELECT location_id, location_name, country, category,
            COUNT(*) AS elephant_count,
            SUM(status = 'living') AS living_count,
            SUM(name != 'unknown' AND TRIM(name) != '' AND LOWER(TRIM(name)) != 'unnamed') AS named_count
     FROM elephants
     WHERE location_id IS NOT NULL AND location_id != ''
     GROUP BY location_id, location_name, country, category
     ORDER BY elephant_count DESC`
  );

  const docs = rows.map((row) => ({
    id: row.location_id,
    name: row.location_name,
    display_name: normalizeLocationDisplayName(row.location_name),
    country: row.country,
    category: row.category,
    elephant_count: Number(row.elephant_count),
    living_count: Number(row.living_count),
    named_count: Number(row.named_count),
  }));

  if (!docs.length) return 0;

  const client = getTypesenseClient();
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, i + BATCH_SIZE);
    await client.collections(LOCATIONS_COLLECTION).documents().import(batch, { action: "upsert" });
    console.log(`Imported locations ${i + 1}–${i + batch.length}`);
  }

  return docs.length;
}

async function runInit(recreate = false): Promise<void> {
  const client = getTypesenseClient();
  await upsertTypesenseSynonyms(client);
  await ensureCollection(elephantsCollectionSchema, recreate);
  await ensureCollection(locationsCollectionSchema, recreate);
}

async function runSync(mode: "full" | "incremental"): Promise<void> {
  await runInit(false);
  const elephantCount = await syncElephants(mode);
  const locationCount = await syncLocations();
  console.log(`Typesense sync complete (${mode}): ${elephantCount} elephants, ${locationCount} locations`);
}

async function main(): Promise<void> {
  if (!isMysqlConfigured()) {
    console.error("MySQL is not configured — set MYSQL_* env vars");
    process.exit(1);
  }
  if (!isTypesenseConfigured()) {
    console.error("Typesense is not configured — set TYPESENSE_HOST and TYPESENSE_API_KEY");
    process.exit(1);
  }

  const arg = process.argv[2];
  if (arg === "init") {
    await runInit(process.argv[3] === "recreate");
    return;
  }

  if (arg === "recreate") {
    await runInit(true);
    await syncElephants("full");
    await syncLocations();
    console.log("Typesense recreate + full sync complete");
    return;
  }

  const mode = arg === "full" ? "full" : "incremental";
  await runSync(mode);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
