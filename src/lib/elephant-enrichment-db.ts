import mysql, { type Pool, type RowDataPacket } from "mysql2/promise";
import type { ElephantEnrichment } from "@/types/enrichment";
import { getMysqlPool, isMysqlConfigured } from "@/lib/elephant-db";

export { isMysqlConfigured };

export const ENRICHMENTS_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS elephant_enrichments (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  elephant_id VARCHAR(32) NULL,
  source VARCHAR(64) NOT NULL,
  source_slug VARCHAR(128) NOT NULL,
  source_url VARCHAR(512) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  local_name VARCHAR(255) NULL,
  facility VARCHAR(128) NULL,
  location_id VARCHAR(32) NULL,
  sex ENUM('male', 'female', 'unknown') NULL,
  birth_date VARCHAR(64) NULL,
  teaser TEXT NULL,
  story TEXT NULL,
  rescue_date VARCHAR(64) NULL,
  rescue_location VARCHAR(255) NULL,
  herd_friends VARCHAR(255) NULL,
  photos JSON NULL,
  synced_at DATETIME NOT NULL,
  UNIQUE KEY uq_source_slug (source, source_slug),
  INDEX idx_elephant_id (elephant_id),
  INDEX idx_location_id (location_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

interface EnrichmentRow extends RowDataPacket {
  id: string;
  elephant_id: string | null;
  source: string;
  source_slug: string;
  source_url: string;
  display_name: string;
  local_name: string | null;
  facility: string | null;
  location_id: string | null;
  sex: ElephantEnrichment["sex"] | null;
  birth_date: string | null;
  teaser: string | null;
  story: string | null;
  rescue_date: string | null;
  rescue_location: string | null;
  herd_friends: string | null;
  photos: unknown;
  synced_at: Date | string;
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

function rowToEnrichment(row: EnrichmentRow): ElephantEnrichment {
  return {
    id: row.id,
    elephantId: row.elephant_id ?? undefined,
    source: row.source as ElephantEnrichment["source"],
    sourceSlug: row.source_slug,
    sourceUrl: row.source_url,
    displayName: row.display_name,
    localName: row.local_name ?? undefined,
    facility: row.facility ?? undefined,
    locationId: row.location_id ?? undefined,
    sex: row.sex ?? undefined,
    birthDate: row.birth_date ?? undefined,
    teaser: row.teaser ?? undefined,
    story: row.story ?? undefined,
    rescueDate: row.rescue_date ?? undefined,
    rescueLocation: row.rescue_location ?? undefined,
    herdFriends: row.herd_friends ?? undefined,
    photos: parseJson<ElephantEnrichment["photos"]>(row.photos),
    syncedAt:
      row.synced_at instanceof Date
        ? row.synced_at.toISOString()
        : String(row.synced_at),
  };
}

export async function migrateEnrichmentSchema(): Promise<void> {
  const db = getMysqlPool();
  await db.query(ENRICHMENTS_SCHEMA_SQL);
}

export async function upsertEnrichments(records: ElephantEnrichment[]): Promise<void> {
  if (!records.length) return;
  const db = getMysqlPool();
  const sql = `
    INSERT INTO elephant_enrichments (
      id, elephant_id, source, source_slug, source_url, display_name, local_name,
      facility, location_id, sex, birth_date, teaser, story, rescue_date,
      rescue_location, herd_friends, photos, synced_at
    ) VALUES ?
    ON DUPLICATE KEY UPDATE
      elephant_id = VALUES(elephant_id),
      source_url = VALUES(source_url),
      display_name = VALUES(display_name),
      local_name = VALUES(local_name),
      facility = VALUES(facility),
      location_id = VALUES(location_id),
      sex = VALUES(sex),
      birth_date = VALUES(birth_date),
      teaser = VALUES(teaser),
      story = VALUES(story),
      rescue_date = VALUES(rescue_date),
      rescue_location = VALUES(rescue_location),
      herd_friends = VALUES(herd_friends),
      photos = VALUES(photos),
      synced_at = VALUES(synced_at)
  `;

  const values = records.map((r) => [
    r.id,
    r.elephantId ?? null,
    r.source,
    r.sourceSlug,
    r.sourceUrl,
    r.displayName,
    r.localName ?? null,
    r.facility ?? null,
    r.locationId ?? null,
    r.sex ?? null,
    r.birthDate ?? null,
    r.teaser ?? null,
    r.story ?? null,
    r.rescueDate ?? null,
    r.rescueLocation ?? null,
    r.herdFriends ?? null,
    r.photos ? JSON.stringify(r.photos) : null,
    new Date(r.syncedAt),
  ]);

  await db.query(sql, [values]);
}

export async function getEnrichmentByElephantIdMysql(
  elephantId: string
): Promise<ElephantEnrichment | null> {
  const db = getMysqlPool();
  const [rows] = await db.query<EnrichmentRow[]>(
    `SELECT * FROM elephant_enrichments WHERE elephant_id = ? ORDER BY synced_at DESC LIMIT 1`,
    [elephantId]
  );
  return rows[0] ? rowToEnrichment(rows[0]) : null;
}

export async function listEnrichmentsByLocationMysql(
  locationId: string
): Promise<ElephantEnrichment[]> {
  const db = getMysqlPool();
  const [rows] = await db.query<EnrichmentRow[]>(
    `SELECT * FROM elephant_enrichments WHERE location_id = ? OR elephant_id IN (
       SELECT id FROM elephants WHERE location_id = ?
     ) ORDER BY display_name ASC`,
    [locationId, locationId]
  );
  return rows.map(rowToEnrichment);
}
