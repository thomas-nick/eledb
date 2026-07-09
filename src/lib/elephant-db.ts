import mysql, { type Pool, type RowDataPacket } from "mysql2/promise";
import type {
  ElephantRecord,
  ElephantSearchParams,
  ElephantSearchResult,
  ElephantSort,
} from "@/types/elephant";
import type { LocationListResult, LocationSummary } from "@/types/location";
import { normalizeLocationDisplayName } from "@/lib/locationDisplay";
import { getSanctuaryIdsForLocation } from "@/data/elephantSeLocations";

export const ELEPHANTS_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS elephants (
  id VARCHAR(32) NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sex ENUM('male', 'female', 'unknown') NOT NULL DEFAULT 'unknown',
  status ENUM('living', 'deceased') NOT NULL DEFAULT 'living',
  species VARCHAR(32) NOT NULL DEFAULT 'asian',
  subspecies VARCHAR(32) NOT NULL DEFAULT 'unknown',
  birth_date VARCHAR(32) NULL,
  birth_place VARCHAR(512) NULL,
  death_date VARCHAR(32) NULL,
  death_reason VARCHAR(512) NULL,
  age_years INT NULL,
  origin ENUM('wild-caught', 'captive-born', 'unknown') NOT NULL DEFAULT 'unknown',
  location_id VARCHAR(32) NULL,
  location_name VARCHAR(512) NOT NULL,
  country VARCHAR(128) NOT NULL,
  category VARCHAR(32) NOT NULL DEFAULT 'other',
  chip_id VARCHAR(64) NULL,
  local_id VARCHAR(64) NULL,
  regional_ids JSON NULL,
  father_name VARCHAR(255) NULL,
  mother_name VARCHAR(255) NULL,
  father_id VARCHAR(32) NULL,
  mother_id VARCHAR(32) NULL,
  arrival_date VARCHAR(32) NULL,
  management VARCHAR(255) NULL,
  transfers JSON NULL,
  photos JSON NULL,
  sources JSON NULL,
  source_url VARCHAR(512) NOT NULL,
  source VARCHAR(32) NOT NULL DEFAULT 'elephant.se',
  synced_at DATETIME NOT NULL,
  INDEX idx_country (country),
  INDEX idx_source (source),
  INDEX idx_status (status),
  INDEX idx_sex (sex),
  INDEX idx_category (category),
  INDEX idx_subspecies (subspecies),
  INDEX idx_location_id (location_id),
  INDEX idx_father_id (father_id),
  INDEX idx_mother_id (mother_id),
  INDEX idx_location_name (location_name(191)),
  FULLTEXT idx_search (name, location_name, country, father_name, mother_name, chip_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

const MIGRATION_COLUMNS: { name: string; ddl: string }[] = [
  { name: "subspecies", ddl: "ADD COLUMN subspecies VARCHAR(32) NOT NULL DEFAULT 'unknown'" },
  { name: "birth_place", ddl: "ADD COLUMN birth_place VARCHAR(512) NULL" },
  { name: "death_reason", ddl: "ADD COLUMN death_reason VARCHAR(512) NULL" },
  { name: "origin", ddl: "ADD COLUMN origin ENUM('wild-caught', 'captive-born', 'unknown') NOT NULL DEFAULT 'unknown'" },
  { name: "chip_id", ddl: "ADD COLUMN chip_id VARCHAR(64) NULL" },
  { name: "local_id", ddl: "ADD COLUMN local_id VARCHAR(64) NULL" },
  { name: "regional_ids", ddl: "ADD COLUMN regional_ids JSON NULL" },
  { name: "transfers", ddl: "ADD COLUMN transfers JSON NULL" },
  { name: "photos", ddl: "ADD COLUMN photos JSON NULL" },
  { name: "sources", ddl: "ADD COLUMN sources JSON NULL" },
  { name: "source", ddl: "ADD COLUMN source VARCHAR(32) NOT NULL DEFAULT 'elephant.se'" },
];

interface ElephantRow extends RowDataPacket {
  id: string;
  name: string;
  sex: ElephantRecord["sex"];
  status: ElephantRecord["status"];
  species: "asian";
  subspecies: ElephantRecord["subspecies"];
  birth_date: string | null;
  birth_place: string | null;
  death_date: string | null;
  death_reason: string | null;
  age_years: number | null;
  origin: ElephantRecord["origin"];
  location_id: string | null;
  location_name: string;
  country: string;
  category: ElephantRecord["category"];
  chip_id: string | null;
  local_id: string | null;
  regional_ids: unknown;
  father_name: string | null;
  mother_name: string | null;
  father_id: string | null;
  mother_id: string | null;
  arrival_date: string | null;
  management: string | null;
  transfers: unknown;
  photos: unknown;
  sources: unknown;
  source_url: string;
  synced_at: Date | string;
}

let pool: Pool | null = null;
let facetCache: { key: string; data: ElephantSearchResult["facets"]; expires: number } | null = null;
const FACET_CACHE_MS = 5 * 60 * 1000;

export function isMysqlConfigured(): boolean {
  return Boolean(
    process.env.MYSQL_HOST &&
      process.env.MYSQL_USER &&
      process.env.MYSQL_DATABASE &&
      process.env.MYSQL_HOST !== "disabled"
  );
}

export function getMysqlPool(): Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT ?? 3306),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 8,
      timezone: "Z",
    });
  }
  return pool;
}

function parseJson<T>(value: unknown): T | undefined {
  if (value == null) return undefined;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return undefined;
    }
  }
  return value as T;
}

function formatDate(value: string | Date | null | undefined): string | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 32);
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
    birthPlace: row.birth_place ?? undefined,
    deathDate: formatDate(row.death_date),
    deathReason: row.death_reason ?? undefined,
    ageYears: row.age_years ?? undefined,
    origin: row.origin ?? "unknown",
    locationId: row.location_id ?? undefined,
    locationName: row.location_name,
    country: row.country,
    category: row.category,
    chipId: row.chip_id ?? undefined,
    localId: row.local_id ?? undefined,
    regionalIds: parseJson<Record<string, string>>(row.regional_ids),
    fatherName: row.father_name ?? undefined,
    motherName: row.mother_name ?? undefined,
    fatherId: row.father_id ?? undefined,
    motherId: row.mother_id ?? undefined,
    arrivalDate: formatDate(row.arrival_date),
    management: row.management ?? undefined,
    transfers: parseJson<ElephantRecord["transfers"]>(row.transfers),
    photos: parseJson<ElephantRecord["photos"]>(row.photos),
    sources: parseJson<string[]>(row.sources),
    sourceUrl: row.source_url,
    syncedAt:
      row.synced_at instanceof Date
        ? row.synced_at.toISOString()
        : new Date(row.synced_at).toISOString(),
  };
}

function recordToRow(record: ElephantRecord) {
  return [
    record.id,
    record.name,
    record.sex,
    record.status,
    record.species,
    record.subspecies ?? "unknown",
    record.birthDate || null,
    record.birthPlace || null,
    record.deathDate || null,
    record.deathReason || null,
    record.ageYears ?? null,
    record.origin ?? "unknown",
    record.locationId || null,
    record.locationName,
    record.country,
    record.category,
    record.chipId || null,
    record.localId || null,
    record.regionalIds ? JSON.stringify(record.regionalIds) : null,
    record.fatherName || null,
    record.motherName || null,
    record.fatherId || null,
    record.motherId || null,
    record.arrivalDate || null,
    record.management || null,
    record.transfers ? JSON.stringify(record.transfers) : null,
    record.photos ? JSON.stringify(record.photos) : null,
    record.sources ? JSON.stringify(record.sources) : null,
    record.sourceUrl,
    new Date(record.syncedAt),
  ];
}

export async function initElephantSchema(): Promise<void> {
  const db = getMysqlPool();
  await db.query(ELEPHANTS_SCHEMA_SQL);
}

export async function migrateElephantSchema(): Promise<void> {
  const db = getMysqlPool();
  await db.query(ELEPHANTS_SCHEMA_SQL);

  const [existing] = await db.query<RowDataPacket[]>(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'elephants'`
  );
  const columnNames = new Set(existing.map((r) => String(r.COLUMN_NAME)));

  for (const col of MIGRATION_COLUMNS) {
    if (!columnNames.has(col.name)) {
      await db.query(`ALTER TABLE elephants ${col.ddl}`);
      console.log(`Added column: ${col.name}`);
    }
  }

  const dateColumns = ["birth_date", "death_date", "arrival_date"];
  for (const col of dateColumns) {
    if (columnNames.has(col)) {
      try {
        await db.query(`ALTER TABLE elephants MODIFY ${col} VARCHAR(32) NULL`);
      } catch {
        // already varchar
      }
    }
  }

  const indexMigrations = [
    "CREATE INDEX idx_subspecies ON elephants (subspecies)",
    "CREATE INDEX idx_father_id ON elephants (father_id)",
    "CREATE INDEX idx_mother_id ON elephants (mother_id)",
    "CREATE INDEX idx_source ON elephants (source)",
  ];
  for (const sql of indexMigrations) {
    try {
      await db.query(sql);
    } catch {
      // index may already exist
    }
  }

  await migrateFulltextSearchIndex(db);
}

async function migrateFulltextSearchIndex(db: Pool) {
  const expectedColumns =
    "name, location_name, country, father_name, mother_name, chip_id";
  try {
    const [indexes] = await db.query<RowDataPacket[]>(
      `SHOW INDEX FROM elephants WHERE Key_name = 'idx_search'`
    );
    const indexedColumns = indexes
      .sort((a, b) => Number(a.Seq_in_index) - Number(b.Seq_in_index))
      .map((r) => String(r.Column_name))
      .join(", ");
    if (indexedColumns === expectedColumns) return;

    if (indexes.length > 0) {
      await db.query("ALTER TABLE elephants DROP INDEX idx_search");
      console.log("Dropped outdated FULLTEXT index idx_search");
    }
  } catch {
    // no index yet
  }

  try {
    await db.query(
      `ALTER TABLE elephants ADD FULLTEXT idx_search (${expectedColumns})`
    );
    console.log("Created FULLTEXT index idx_search");
  } catch (err) {
    console.warn("FULLTEXT index migration skipped:", err);
  }
}

// Camp-owned elephants live under a `camp_`-prefixed id namespace with source='camp'.
// The elephant.se crawl only ever produces numeric ids (source='elephant.se') and never
// issues DELETEs, so manager-created records can never be overwritten by a sync.
export async function upsertElephants(records: ElephantRecord[]): Promise<void> {
  if (records.length === 0) return;
  facetCache = null;
  const db = getMysqlPool();
  const sql = `
    INSERT INTO elephants (
      id, name, sex, status, species, subspecies, birth_date, birth_place, death_date,
      death_reason, age_years, origin, location_id, location_name, country, category,
      chip_id, local_id, regional_ids, father_name, mother_name, father_id, mother_id,
      arrival_date, management, transfers, photos, sources, source_url, synced_at
    ) VALUES ?
    ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      sex = VALUES(sex),
      status = VALUES(status),
      species = VALUES(species),
      subspecies = VALUES(subspecies),
      birth_date = VALUES(birth_date),
      birth_place = VALUES(birth_place),
      death_date = VALUES(death_date),
      death_reason = VALUES(death_reason),
      age_years = VALUES(age_years),
      origin = VALUES(origin),
      location_id = VALUES(location_id),
      location_name = VALUES(location_name),
      country = VALUES(country),
      category = VALUES(category),
      chip_id = VALUES(chip_id),
      local_id = VALUES(local_id),
      regional_ids = VALUES(regional_ids),
      father_name = VALUES(father_name),
      mother_name = VALUES(mother_name),
      father_id = VALUES(father_id),
      mother_id = VALUES(mother_id),
      arrival_date = VALUES(arrival_date),
      management = VALUES(management),
      transfers = VALUES(transfers),
      photos = VALUES(photos),
      sources = VALUES(sources),
      source_url = VALUES(source_url),
      synced_at = VALUES(synced_at)
  `;
  const rows = records.map(recordToRow);
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await db.query(sql, [rows]);
      return;
    } catch (err) {
      const retryable =
        err instanceof Error &&
        ("code" in err
          ? err.code === "ETIMEDOUT" ||
            err.code === "ECONNRESET" ||
            err.code === "PROTOCOL_CONNECTION_LOST"
          : false);
      if (!retryable || attempt === 3) throw err;
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
}

type FilterClause = { sql: string; params: (string | number)[] };

/** Facet dimensions that can be excluded when scoping facet counts. */
type FacetDimension = "country" | "status" | "category" | "subspecies" | "location";

function buildFilters(
  params: ElephantSearchParams,
  exclude?: FacetDimension
): FilterClause {
  const parts: string[] = [];
  const values: (string | number)[] = [];

  if (params.country && exclude !== "country") {
    parts.push("country = ?");
    values.push(params.country);
  }
  if (params.status && exclude !== "status") {
    parts.push("status = ?");
    values.push(params.status);
  }
  if (params.sex) {
    parts.push("sex = ?");
    values.push(params.sex);
  }
  if (params.subspecies && exclude !== "subspecies") {
    parts.push("subspecies = ?");
    values.push(params.subspecies);
  }
  if (exclude !== "location") {
    if (params.locationId) {
      parts.push("location_id = ?");
      values.push(params.locationId);
    } else if (params.locationName) {
      parts.push("location_name = ?");
      values.push(params.locationName);
    }
  }
  if (params.category && exclude !== "category") {
    parts.push("category = ?");
    values.push(params.category);
  }
  if (params.namedOnly) {
    parts.push("name != 'unknown' AND TRIM(name) != '' AND LOWER(TRIM(name)) != 'unnamed'");
  }
  if (params.hasStory) {
    parts.push(
      "id IN (SELECT elephant_id FROM elephant_enrichments WHERE elephant_id IS NOT NULL)"
    );
  }

  return {
    sql: parts.length ? ` AND ${parts.join(" AND ")}` : "",
    params: values,
  };
}

/** True when the query has any filter/search that should scope facet counts. */
function hasActiveScope(params: ElephantSearchParams): boolean {
  return Boolean(
    params.q?.trim() ||
      params.country ||
      params.status ||
      params.sex ||
      params.subspecies ||
      params.category ||
      params.locationId ||
      params.locationName ||
      params.hasStory ||
      params.namedOnly
  );
}

function buildSearchClause(q?: string): FilterClause {
  const term = q?.trim();
  if (!term) return { sql: "", params: [] };

  const like = `%${term}%`;
  // LIKE works reliably across all migrations; FULLTEXT requires idx_search with chip_id
  return {
    sql: ` AND (
      name LIKE ? OR location_name LIKE ? OR country LIKE ?
      OR father_name LIKE ? OR mother_name LIKE ? OR chip_id LIKE ?
    )`,
    params: [like, like, like, like, like, like],
  };
}

function buildOrderClause(sort?: ElephantSort): string {
  switch (sort) {
    case "age":
      return "ORDER BY age_years IS NULL, age_years DESC, name ASC";
    case "updated":
      return "ORDER BY synced_at DESC, name ASC";
    default:
      return "ORDER BY name ASC";
  }
}

async function facetQuery(
  db: Pool,
  column: string,
  baseWhere: string,
  baseParams: (string | number)[]
) {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT ${column} AS value, COUNT(*) AS count
     FROM elephants
     WHERE 1=1 ${baseWhere} AND ${column} IS NOT NULL AND ${column} != ''
     GROUP BY ${column}
     ORDER BY count DESC
     LIMIT 30`,
    baseParams
  );
  return rows.map((row) => ({
    value: String(row.value),
    count: Number(row.count),
  }));
}

async function getGlobalFacets(db: Pool): Promise<ElephantSearchResult["facets"]> {
  const cacheKey = "global";
  if (facetCache && facetCache.key === cacheKey && facetCache.expires > Date.now()) {
    return facetCache.data;
  }

  const [countries, statuses, categories, subspecies, locations] = await Promise.all([
    facetQuery(db, "country", "", []),
    facetQuery(db, "status", "", []),
    facetQuery(db, "category", "", []),
    facetQuery(db, "subspecies", "", []),
    facetQuery(db, "location_name", "", []),
  ]);

  const facets = { countries, statuses, categories, subspecies, locations };
  facetCache = { key: cacheKey, data: facets, expires: Date.now() + FACET_CACHE_MS };
  return facets;
}

/**
 * Facet counts scoped to the active query. Each dimension is computed against
 * all *other* active filters (plus the search term) but excludes its own filter,
 * so users can still see and switch between values within that dimension.
 */
async function getScopedFacets(
  db: Pool,
  params: ElephantSearchParams,
  search: FilterClause
): Promise<ElephantSearchResult["facets"]> {
  const scope = (column: string, dimension: FacetDimension) => {
    const filters = buildFilters(params, dimension);
    const where = `${filters.sql}${search.sql}`;
    return facetQuery(db, column, where, [...filters.params, ...search.params]);
  };

  const [countries, statuses, categories, subspecies, locations] = await Promise.all([
    scope("country", "country"),
    scope("status", "status"),
    scope("category", "category"),
    scope("subspecies", "subspecies"),
    scope("location_name", "location"),
  ]);

  return { countries, statuses, categories, subspecies, locations };
}

export async function searchElephantsMysql(
  params: ElephantSearchParams
): Promise<ElephantSearchResult> {
  const db = getMysqlPool();
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 24;
  const offset = (page - 1) * perPage;

  const filters = buildFilters(params);
  const search = buildSearchClause(params.q);
  const where = `${filters.sql}${search.sql}`;
  const whereParams = [...filters.params, ...search.params];

  const [countRows] = await db.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM elephants WHERE 1=1 ${where}`,
    whereParams
  );
  const total = Number(countRows[0]?.total ?? 0);

  const [rows] = await db.query<ElephantRow[]>(
    `SELECT * FROM elephants
     WHERE 1=1 ${where}
     ${buildOrderClause(params.sort)}
     LIMIT ? OFFSET ?`,
    [...whereParams, perPage, offset]
  );

  // Cached global facets for the unfiltered landing view; scoped facets otherwise.
  const facets = hasActiveScope(params)
    ? await getScopedFacets(db, params, search)
    : await getGlobalFacets(db);

  return {
    elephants: rows.map(rowToRecord),
    total,
    page,
    perPage,
    facets,
    source: "mysql",
  };
}

export async function getElephantByIdMysql(id: string): Promise<ElephantRecord | null> {
  const db = getMysqlPool();
  const [rows] = await db.query<ElephantRow[]>(
    "SELECT * FROM elephants WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0] ? rowToRecord(rows[0]) : null;
}

export async function getOffspringMysql(id: string): Promise<ElephantRecord[]> {
  const db = getMysqlPool();
  const [rows] = await db.query<ElephantRow[]>(
    `SELECT * FROM elephants WHERE father_id = ? OR mother_id = ? ORDER BY name ASC LIMIT 50`,
    [id, id]
  );
  return rows.map(rowToRecord);
}

export async function getHerdMatesMysql(
  locationId: string,
  excludeId: string
): Promise<ElephantRecord[]> {
  const db = getMysqlPool();
  const [rows] = await db.query<ElephantRow[]>(
    `SELECT * FROM elephants
     WHERE location_id = ? AND id != ? AND status = 'living'
     ORDER BY name ASC LIMIT 30`,
    [locationId, excludeId]
  );
  return rows.map(rowToRecord);
}

export async function countElephantsMysql(): Promise<number> {
  const db = getMysqlPool();
  const [rows] = await db.query<RowDataPacket[]>("SELECT COUNT(*) AS total FROM elephants");
  return Number(rows[0]?.total ?? 0);
}

/** Living + deceased counts per elephant.se location_id (for sanctuary directory). */
export async function getElephantCountsByLocationIds(
  locationIds: string[]
): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  if (!locationIds.length) return counts;

  const db = getMysqlPool();
  const placeholders = locationIds.map(() => "?").join(", ");
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT location_id, COUNT(*) AS total
     FROM elephants
     WHERE location_id IN (${placeholders})
     GROUP BY location_id`,
    locationIds
  );

  for (const row of rows) {
    counts[String(row.location_id)] = Number(row.total);
  }
  return counts;
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

function rowToLocation(row: LocationRow): LocationSummary {
  const name = row.location_name;
  return {
    id: row.location_id,
    name,
    displayName: normalizeLocationDisplayName(name),
    country: row.country,
    category: row.category as LocationSummary["category"],
    elephantCount: Number(row.elephant_count),
    livingCount: Number(row.living_count),
    namedCount: Number(row.named_count),
    sanctuaryIds: getSanctuaryIdsForLocation(row.location_id),
  };
}

export async function listLocationsMysql(options: {
  country?: string;
  category?: string;
  q?: string;
  limit?: number;
  offset?: number;
}): Promise<LocationListResult> {
  const db = getMysqlPool();
  const limit = options.limit ?? 30;
  const offset = options.offset ?? 0;
  const parts: string[] = ["location_id IS NOT NULL", "location_id != ''"];
  const params: (string | number)[] = [];

  if (options.country) {
    parts.push("country = ?");
    params.push(options.country);
  }
  if (options.category) {
    parts.push("category = ?");
    params.push(options.category);
  }
  if (options.q?.trim()) {
    parts.push("location_name LIKE ?");
    params.push(`%${options.q.trim()}%`);
  }

  const where = parts.join(" AND ");

  const [countRows] = await db.query<RowDataPacket[]>(
    `SELECT COUNT(DISTINCT location_id) AS total FROM elephants WHERE ${where}`,
    params
  );
  const total = Number(countRows[0]?.total ?? 0);

  const [rows] = await db.query<LocationRow[]>(
    `SELECT location_id, location_name, country, category,
            COUNT(*) AS elephant_count,
            SUM(status = 'living') AS living_count,
            SUM(name != 'unknown' AND TRIM(name) != '' AND LOWER(TRIM(name)) != 'unnamed') AS named_count
     FROM elephants
     WHERE ${where}
     GROUP BY location_id, location_name, country, category
     ORDER BY elephant_count DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    locations: rows.map(rowToLocation),
    total,
    source: "mysql",
  };
}

export async function getLocationMysql(locationId: string): Promise<LocationSummary | null> {
  const db = getMysqlPool();
  const [rows] = await db.query<LocationRow[]>(
    `SELECT location_id, location_name, country, category,
            COUNT(*) AS elephant_count,
            SUM(status = 'living') AS living_count,
            SUM(name != 'unknown' AND TRIM(name) != '' AND LOWER(TRIM(name)) != 'unnamed') AS named_count
     FROM elephants
     WHERE location_id = ?
     GROUP BY location_id, location_name, country, category
     LIMIT 1`,
    [locationId]
  );
  return rows[0] ? rowToLocation(rows[0]) : null;
}

export interface CountryDbStats {
  total: number;
  living: number;
  deceased: number;
  named: number;
  campCount: number;
}

export interface SiteStats {
  total: number;
  named: number;
  living: number;
  campCount: number;
  countryCount: number;
  lastSyncedAt?: string | null;
}

export async function getSiteStatsMysql(): Promise<SiteStats> {
  const db = getMysqlPool();
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT
       COUNT(*) AS total,
       SUM(status = 'living') AS living,
       SUM(name != 'unknown' AND TRIM(name) != '' AND LOWER(TRIM(name)) != 'unnamed') AS named,
       COUNT(DISTINCT CASE WHEN location_id IS NOT NULL AND location_id != '' THEN location_id END) AS camp_count,
       COUNT(DISTINCT country) AS country_count,
       MAX(synced_at) AS last_synced_at
     FROM elephants`
  );
  const row = rows[0];
  return {
    total: Number(row?.total ?? 0),
    living: Number(row?.living ?? 0),
    named: Number(row?.named ?? 0),
    campCount: Number(row?.camp_count ?? 0),
    countryCount: Number(row?.country_count ?? 0),
    lastSyncedAt: row?.last_synced_at
      ? new Date(row.last_synced_at as string | Date).toISOString()
      : null,
  };
}

export async function getCountryStatsMysql(dbCountry: string): Promise<CountryDbStats> {
  const db = getMysqlPool();
  const [statRows] = await db.query<RowDataPacket[]>(
    `SELECT
       COUNT(*) AS total,
       SUM(status = 'living') AS living,
       SUM(status = 'deceased') AS deceased,
       SUM(name != 'unknown' AND TRIM(name) != '' AND LOWER(TRIM(name)) != 'unnamed') AS named
     FROM elephants
     WHERE country = ?`,
    [dbCountry]
  );
  const [campRows] = await db.query<RowDataPacket[]>(
    `SELECT COUNT(DISTINCT location_id) AS camp_count
     FROM elephants
     WHERE country = ? AND location_id IS NOT NULL AND location_id != ''`,
    [dbCountry]
  );
  const row = statRows[0];
  return {
    total: Number(row?.total ?? 0),
    living: Number(row?.living ?? 0),
    deceased: Number(row?.deceased ?? 0),
    named: Number(row?.named ?? 0),
    campCount: Number(campRows[0]?.camp_count ?? 0),
  };
}
