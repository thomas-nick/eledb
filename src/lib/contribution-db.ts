import { randomUUID } from "crypto";
import type { RowDataPacket } from "mysql2/promise";
import type { ElephantRecord } from "@/types/elephant";
import type {
  CommunityPhoto,
  ContributionRecord,
  ContributionStatus,
  ContributionType,
  ElephantOverride,
  InfoContributionPayload,
  OverrideFieldKey,
  PhotoContributionPayload,
} from "@/types/contribution";
import { OVERRIDE_FIELD_KEYS } from "@/types/contribution";
import { getMysqlPool, isMysqlConfigured } from "@/lib/elephant-db";
import { migrateAuthSchema } from "@/lib/auth-db";

export const CONTRIBUTIONS_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS contributions (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  elephant_id VARCHAR(32) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  type ENUM('info', 'photo') NOT NULL,
  payload JSON NOT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  reviewer_id VARCHAR(36) NULL,
  review_note TEXT NULL,
  created_at DATETIME NOT NULL,
  reviewed_at DATETIME NULL,
  INDEX idx_elephant_id (elephant_id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS community_photos (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  elephant_id VARCHAR(32) NOT NULL,
  contribution_id VARCHAR(36) NULL,
  url VARCHAR(512) NOT NULL,
  credit VARCHAR(255) NULL,
  caption TEXT NULL,
  uploaded_by VARCHAR(36) NULL,
  created_at DATETIME NOT NULL,
  INDEX idx_elephant_id (elephant_id),
  INDEX idx_uploaded_by (uploaded_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS elephant_overrides (
  elephant_id VARCHAR(32) NOT NULL PRIMARY KEY,
  fields JSON NOT NULL,
  updated_by VARCHAR(36) NULL,
  updated_at DATETIME NOT NULL,
  INDEX idx_updated_by (updated_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

interface ContributionRow extends RowDataPacket {
  id: string;
  elephant_id: string;
  user_id: string;
  type: ContributionType;
  payload: unknown;
  status: ContributionStatus;
  reviewer_id: string | null;
  review_note: string | null;
  created_at: Date | string;
  reviewed_at: Date | string | null;
  user_name?: string | null;
  user_email?: string | null;
}

interface CommunityPhotoRow extends RowDataPacket {
  id: string;
  elephant_id: string;
  contribution_id: string | null;
  url: string;
  credit: string | null;
  caption: string | null;
  uploaded_by: string | null;
  created_at: Date | string;
  uploader_name?: string | null;
}

interface OverrideRow extends RowDataPacket {
  elephant_id: string;
  fields: unknown;
  updated_by: string | null;
  updated_at: Date | string;
}

function parseJson<T>(value: unknown): T {
  if (typeof value === "string") return JSON.parse(value) as T;
  return value as T;
}

function formatDate(value: Date | string | null | undefined): string | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString();
  return new Date(value).toISOString();
}

function rowToContribution(row: ContributionRow): ContributionRecord {
  return {
    id: row.id,
    elephantId: row.elephant_id,
    userId: row.user_id,
    type: row.type,
    payload: parseJson(row.payload),
    status: row.status,
    reviewerId: row.reviewer_id ?? undefined,
    reviewNote: row.review_note ?? undefined,
    createdAt: formatDate(row.created_at)!,
    reviewedAt: formatDate(row.reviewed_at),
    userName: row.user_name ?? undefined,
    userEmail: row.user_email ?? undefined,
  };
}

function rowToCommunityPhoto(row: CommunityPhotoRow): CommunityPhoto {
  return {
    id: row.id,
    elephantId: row.elephant_id,
    contributionId: row.contribution_id ?? undefined,
    url: row.url,
    credit: row.credit ?? undefined,
    caption: row.caption ?? undefined,
    uploadedBy: row.uploaded_by ?? undefined,
    uploaderName: row.uploader_name ?? undefined,
    createdAt: formatDate(row.created_at)!,
  };
}

export async function migrateContributionSchema(): Promise<void> {
  await migrateAuthSchema();
  const db = getMysqlPool();
  await db.query(CONTRIBUTIONS_SCHEMA_SQL);
}

export function isOverrideField(key: string): key is OverrideFieldKey {
  return (OVERRIDE_FIELD_KEYS as readonly string[]).includes(key);
}

export function pickOverrideChanges(
  changes: Record<string, unknown>
): Partial<Record<OverrideFieldKey, string | number>> {
  const picked: Partial<Record<OverrideFieldKey, string | number>> = {};
  for (const key of OVERRIDE_FIELD_KEYS) {
    if (changes[key] !== undefined && changes[key] !== null && changes[key] !== "") {
      picked[key] = changes[key] as string | number;
    }
  }
  return picked;
}

export async function createContribution(input: {
  elephantId: string;
  userId: string;
  type: ContributionType;
  payload: PhotoContributionPayload | InfoContributionPayload;
}): Promise<ContributionRecord> {
  const db = getMysqlPool();
  const id = randomUUID();
  const now = new Date();

  await db.query(
    `INSERT INTO contributions (id, elephant_id, user_id, type, payload, status, created_at)
     VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
    [id, input.elephantId, input.userId, input.type, JSON.stringify(input.payload), now]
  );

  return {
    id,
    elephantId: input.elephantId,
    userId: input.userId,
    type: input.type,
    payload: input.payload,
    status: "pending",
    createdAt: now.toISOString(),
  };
}

export async function listContributionsByUser(userId: string): Promise<ContributionRecord[]> {
  const db = getMysqlPool();
  const [rows] = await db.query<ContributionRow[]>(
    `SELECT c.*, u.name AS user_name, u.email AS user_email
     FROM contributions c
     LEFT JOIN users u ON u.id = c.user_id
     WHERE c.user_id = ?
     ORDER BY c.created_at DESC
     LIMIT 100`,
    [userId]
  );
  return rows.map(rowToContribution);
}

export async function listPendingContributions(): Promise<ContributionRecord[]> {
  const db = getMysqlPool();
  const [rows] = await db.query<ContributionRow[]>(
    `SELECT c.*, u.name AS user_name, u.email AS user_email
     FROM contributions c
     LEFT JOIN users u ON u.id = c.user_id
     WHERE c.status = 'pending'
     ORDER BY c.created_at ASC
     LIMIT 200`
  );
  return rows.map(rowToContribution);
}

export async function listContributionsByElephant(
  elephantId: string,
  limit = 20
): Promise<ContributionRecord[]> {
  if (!isMysqlConfigured()) return [];
  try {
    const db = getMysqlPool();
    const [rows] = await db.query<ContributionRow[]>(
      `SELECT c.*, u.name AS user_name, u.email AS user_email
       FROM contributions c
       LEFT JOIN users u ON u.id = c.user_id
       WHERE c.elephant_id = ? AND c.status = 'approved'
       ORDER BY c.reviewed_at DESC
       LIMIT ?`,
      [elephantId, limit]
    );
    return rows.map(rowToContribution);
  } catch (err) {
    if (isMissingTableError(err)) return [];
    throw err;
  }
}

export async function getContributionById(id: string): Promise<ContributionRecord | null> {
  const db = getMysqlPool();
  const [rows] = await db.query<ContributionRow[]>(
    `SELECT c.*, u.name AS user_name, u.email AS user_email
     FROM contributions c
     LEFT JOIN users u ON u.id = c.user_id
     WHERE c.id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] ? rowToContribution(rows[0]) : null;
}

export async function approveContribution(
  id: string,
  reviewerId: string,
  reviewNote?: string
): Promise<ContributionRecord | null> {
  const db = getMysqlPool();
  const contribution = await getContributionById(id);
  if (!contribution || contribution.status !== "pending") return null;

  const now = new Date();

  if (contribution.type === "photo") {
    const payload = contribution.payload as PhotoContributionPayload;
    const photoId = randomUUID();
    await db.query(
      `INSERT INTO community_photos (id, elephant_id, contribution_id, url, credit, caption, uploaded_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        photoId,
        contribution.elephantId,
        contribution.id,
        payload.publicUrl,
        payload.credit ?? null,
        payload.caption ?? null,
        contribution.userId,
        now,
      ]
    );
  } else {
    const payload = contribution.payload as InfoContributionPayload;
    const existing = await getElephantOverride(contribution.elephantId);
    const merged = { ...(existing?.fields ?? {}), ...payload.changes };
    await db.query(
      `INSERT INTO elephant_overrides (elephant_id, fields, updated_by, updated_at)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE fields = VALUES(fields), updated_by = VALUES(updated_by), updated_at = VALUES(updated_at)`,
      [contribution.elephantId, JSON.stringify(merged), contribution.userId, now]
    );
  }

  await db.query(
    `UPDATE contributions SET status = 'approved', reviewer_id = ?, review_note = ?, reviewed_at = ?
     WHERE id = ?`,
    [reviewerId, reviewNote ?? null, now, id]
  );

  return getContributionById(id);
}

export async function rejectContribution(
  id: string,
  reviewerId: string,
  reviewNote?: string
): Promise<ContributionRecord | null> {
  const db = getMysqlPool();
  const now = new Date();
  await db.query(
    `UPDATE contributions SET status = 'rejected', reviewer_id = ?, review_note = ?, reviewed_at = ?
     WHERE id = ? AND status = 'pending'`,
    [reviewerId, reviewNote ?? null, now, id]
  );
  return getContributionById(id);
}

function isMissingTableError(err: unknown): boolean {
  return Boolean(
    err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code?: string }).code === "ER_NO_SUCH_TABLE"
  );
}

export async function getCommunityPhotos(elephantId: string): Promise<CommunityPhoto[]> {
  if (!isMysqlConfigured()) return [];
  try {
    const db = getMysqlPool();
    const [rows] = await db.query<CommunityPhotoRow[]>(
      `SELECT cp.*, u.name AS uploader_name
       FROM community_photos cp
       LEFT JOIN users u ON u.id = cp.uploaded_by
       WHERE cp.elephant_id = ?
       ORDER BY cp.created_at DESC`,
      [elephantId]
    );
    return rows.map(rowToCommunityPhoto);
  } catch (err) {
    if (isMissingTableError(err)) return [];
    throw err;
  }
}

export async function getCommunityPhotoSummaries(
  elephantIds: string[]
): Promise<Map<string, { url: string }>> {
  const map = new Map<string, { url: string }>();
  if (!elephantIds.length || !isMysqlConfigured()) return map;

  try {
    const db = getMysqlPool();
    const placeholders = elephantIds.map(() => "?").join(", ");
    const [rows] = await db.query<CommunityPhotoRow[]>(
      `SELECT elephant_id, url FROM community_photos
       WHERE elephant_id IN (${placeholders})
       ORDER BY created_at DESC`,
      elephantIds
    );

    for (const row of rows) {
      if (!map.has(row.elephant_id)) {
        map.set(row.elephant_id, { url: row.url });
      }
    }
  } catch (err) {
    if (isMissingTableError(err)) return map;
    throw err;
  }
  return map;
}

export async function getElephantOverride(elephantId: string): Promise<ElephantOverride | null> {
  if (!isMysqlConfigured()) return null;
  try {
    const db = getMysqlPool();
    const [rows] = await db.query<OverrideRow[]>(
      "SELECT * FROM elephant_overrides WHERE elephant_id = ? LIMIT 1",
      [elephantId]
    );
    if (!rows[0]) return null;
    return {
      elephantId: rows[0].elephant_id,
      fields: parseJson(rows[0].fields),
      updatedBy: rows[0].updated_by ?? undefined,
      updatedAt: formatDate(rows[0].updated_at)!,
    };
  } catch (err) {
    if (isMissingTableError(err)) return null;
    throw err;
  }
}

export function applyElephantOverride(
  record: ElephantRecord,
  override: ElephantOverride | null
): ElephantRecord {
  if (!override?.fields) return record;
  const merged = { ...record };
  for (const key of OVERRIDE_FIELD_KEYS) {
    const value = override.fields[key];
    if (value !== undefined) {
      (merged as Record<string, unknown>)[key] = value;
    }
  }
  return merged;
}

export function computeRecordCompleteness(elephant: ElephantRecord): {
  filled: number;
  total: number;
  percent: number;
} {
  const checks = [
    elephant.name && elephant.name !== "unknown",
    elephant.sex !== "unknown",
    elephant.status,
    elephant.subspecies && elephant.subspecies !== "unknown",
    elephant.birthDate || elephant.ageYears != null,
    elephant.birthPlace,
    elephant.origin && elephant.origin !== "unknown",
    elephant.locationName,
    elephant.country,
    elephant.chipId,
    elephant.fatherName || elephant.fatherId,
    elephant.motherName || elephant.motherId,
    elephant.photos?.length || elephant.photoUrl,
    elephant.management,
    elephant.arrivalDate,
  ];
  const filled = checks.filter(Boolean).length;
  const total = checks.length;
  return { filled, total, percent: Math.round((filled / total) * 100) };
}
