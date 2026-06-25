import { randomUUID } from "crypto";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import type {
  CampClaim,
  CampClaimStatus,
  CampProfile,
  CampProfileFieldKey,
} from "@/types/camp";
import { CAMP_PROFILE_FIELD_KEYS } from "@/types/camp";
import type { ElephantRecord } from "@/types/elephant";
import { getMysqlPool, isMysqlConfigured } from "@/lib/elephant-db";
import { migrateAuthSchema } from "@/lib/auth-db";

export const CAMP_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS camp_profiles (
  location_id VARCHAR(32) NOT NULL PRIMARY KEY,
  description TEXT NULL,
  website VARCHAR(512) NULL,
  contact_email VARCHAR(255) NULL,
  phone VARCHAR(64) NULL,
  address VARCHAR(512) NULL,
  welfare_notes TEXT NULL,
  hero_photo_url VARCHAR(512) NULL,
  updated_by VARCHAR(36) NULL,
  updated_at DATETIME NOT NULL,
  INDEX idx_updated_by (updated_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS camp_claims (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  location_id VARCHAR(32) NOT NULL,
  location_name VARCHAR(512) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  role_at_camp VARCHAR(128) NULL,
  contact VARCHAR(255) NULL,
  message TEXT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  reviewer_id VARCHAR(36) NULL,
  review_note TEXT NULL,
  created_at DATETIME NOT NULL,
  reviewed_at DATETIME NULL,
  INDEX idx_location_id (location_id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS camp_managers (
  location_id VARCHAR(32) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  granted_by VARCHAR(36) NULL,
  created_at DATETIME NOT NULL,
  PRIMARY KEY (location_id, user_id),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

interface CampProfileRow extends RowDataPacket {
  location_id: string;
  description: string | null;
  website: string | null;
  contact_email: string | null;
  phone: string | null;
  address: string | null;
  welfare_notes: string | null;
  hero_photo_url: string | null;
  updated_by: string | null;
  updated_at: Date | string;
}

interface CampClaimRow extends RowDataPacket {
  id: string;
  location_id: string;
  location_name: string;
  user_id: string;
  role_at_camp: string | null;
  contact: string | null;
  message: string | null;
  status: CampClaimStatus;
  reviewer_id: string | null;
  review_note: string | null;
  created_at: Date | string;
  reviewed_at: Date | string | null;
  user_name?: string | null;
  user_email?: string | null;
}

interface ManagerRow extends RowDataPacket {
  location_id: string;
  user_id: string;
  created_at: Date | string;
}

function formatDate(value: Date | string | null | undefined): string | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString();
  return new Date(value).toISOString();
}

function rowToProfile(row: CampProfileRow): CampProfile {
  return {
    locationId: row.location_id,
    description: row.description ?? undefined,
    website: row.website ?? undefined,
    contactEmail: row.contact_email ?? undefined,
    phone: row.phone ?? undefined,
    address: row.address ?? undefined,
    welfareNotes: row.welfare_notes ?? undefined,
    heroPhotoUrl: row.hero_photo_url ?? undefined,
    updatedBy: row.updated_by ?? undefined,
    updatedAt: formatDate(row.updated_at)!,
  };
}

function rowToClaim(row: CampClaimRow): CampClaim {
  return {
    id: row.id,
    locationId: row.location_id,
    locationName: row.location_name,
    userId: row.user_id,
    roleAtCamp: row.role_at_camp ?? undefined,
    contact: row.contact ?? undefined,
    message: row.message ?? undefined,
    status: row.status,
    reviewerId: row.reviewer_id ?? undefined,
    reviewNote: row.review_note ?? undefined,
    createdAt: formatDate(row.created_at)!,
    reviewedAt: formatDate(row.reviewed_at),
    userName: row.user_name ?? undefined,
    userEmail: row.user_email ?? undefined,
  };
}

function isMissingTableError(err: unknown): boolean {
  return Boolean(
    err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code?: string }).code === "ER_NO_SUCH_TABLE"
  );
}

export async function migrateCampSchema(): Promise<void> {
  await migrateAuthSchema();
  const db = getMysqlPool();
  const statements = CAMP_SCHEMA_SQL.split(";")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const sql of statements) {
    await db.query(sql);
  }
}

// --- Profiles -------------------------------------------------------------

const PROFILE_COLUMN_BY_KEY: Record<CampProfileFieldKey, string> = {
  description: "description",
  website: "website",
  contactEmail: "contact_email",
  phone: "phone",
  address: "address",
  welfareNotes: "welfare_notes",
  heroPhotoUrl: "hero_photo_url",
};

export async function getCampProfile(locationId: string): Promise<CampProfile | null> {
  if (!isMysqlConfigured()) return null;
  try {
    const db = getMysqlPool();
    const [rows] = await db.query<CampProfileRow[]>(
      "SELECT * FROM camp_profiles WHERE location_id = ? LIMIT 1",
      [locationId]
    );
    return rows[0] ? rowToProfile(rows[0]) : null;
  } catch (err) {
    if (isMissingTableError(err)) return null;
    throw err;
  }
}

export function pickProfileChanges(
  changes: Record<string, unknown>
): Partial<Record<CampProfileFieldKey, string>> {
  const picked: Partial<Record<CampProfileFieldKey, string>> = {};
  for (const key of CAMP_PROFILE_FIELD_KEYS) {
    const value = changes[key];
    if (value === undefined) continue;
    picked[key] = value === null ? "" : String(value).trim();
  }
  return picked;
}

export async function upsertCampProfile(input: {
  locationId: string;
  changes: Partial<Record<CampProfileFieldKey, string>>;
  updatedBy: string;
}): Promise<CampProfile> {
  const db = getMysqlPool();
  const now = new Date();
  const keys = Object.keys(input.changes) as CampProfileFieldKey[];

  const columns = keys.map((k) => PROFILE_COLUMN_BY_KEY[k]);
  const values = keys.map((k) => {
    const v = input.changes[k];
    return v === "" ? null : v ?? null;
  });

  const insertCols = ["location_id", ...columns, "updated_by", "updated_at"];
  const insertPlaceholders = insertCols.map(() => "?").join(", ");
  const insertValues = [input.locationId, ...values, input.updatedBy, now];

  const updateAssignments = [
    ...columns.map((c) => `${c} = VALUES(${c})`),
    "updated_by = VALUES(updated_by)",
    "updated_at = VALUES(updated_at)",
  ].join(", ");

  await db.query(
    `INSERT INTO camp_profiles (${insertCols.join(", ")})
     VALUES (${insertPlaceholders})
     ON DUPLICATE KEY UPDATE ${updateAssignments}`,
    insertValues
  );

  return (await getCampProfile(input.locationId))!;
}

// --- Claims ---------------------------------------------------------------

export async function getClaimByUserAndLocation(
  userId: string,
  locationId: string
): Promise<CampClaim | null> {
  if (!isMysqlConfigured()) return null;
  try {
    const db = getMysqlPool();
    const [rows] = await db.query<CampClaimRow[]>(
      `SELECT * FROM camp_claims
       WHERE user_id = ? AND location_id = ?
       ORDER BY created_at DESC LIMIT 1`,
      [userId, locationId]
    );
    return rows[0] ? rowToClaim(rows[0]) : null;
  } catch (err) {
    if (isMissingTableError(err)) return null;
    throw err;
  }
}

export async function createCampClaim(input: {
  locationId: string;
  locationName: string;
  userId: string;
  roleAtCamp?: string;
  contact?: string;
  message?: string;
}): Promise<CampClaim> {
  const db = getMysqlPool();
  const id = randomUUID();
  const now = new Date();

  await db.query(
    `INSERT INTO camp_claims
       (id, location_id, location_name, user_id, role_at_camp, contact, message, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
    [
      id,
      input.locationId,
      input.locationName,
      input.userId,
      input.roleAtCamp ?? null,
      input.contact ?? null,
      input.message ?? null,
      now,
    ]
  );

  return {
    id,
    locationId: input.locationId,
    locationName: input.locationName,
    userId: input.userId,
    roleAtCamp: input.roleAtCamp,
    contact: input.contact,
    message: input.message,
    status: "pending",
    createdAt: now.toISOString(),
  };
}

export async function getClaimById(id: string): Promise<CampClaim | null> {
  const db = getMysqlPool();
  const [rows] = await db.query<CampClaimRow[]>(
    `SELECT c.*, u.name AS user_name, u.email AS user_email
     FROM camp_claims c
     LEFT JOIN users u ON u.id = c.user_id
     WHERE c.id = ? LIMIT 1`,
    [id]
  );
  return rows[0] ? rowToClaim(rows[0]) : null;
}

export async function listPendingClaims(): Promise<CampClaim[]> {
  const db = getMysqlPool();
  const [rows] = await db.query<CampClaimRow[]>(
    `SELECT c.*, u.name AS user_name, u.email AS user_email
     FROM camp_claims c
     LEFT JOIN users u ON u.id = c.user_id
     WHERE c.status = 'pending'
     ORDER BY c.created_at ASC
     LIMIT 200`
  );
  return rows.map(rowToClaim);
}

export async function approveClaim(
  id: string,
  reviewerId: string,
  reviewNote?: string
): Promise<CampClaim | null> {
  const db = getMysqlPool();
  const claim = await getClaimById(id);
  if (!claim || claim.status !== "pending") return null;

  const now = new Date();
  await db.query(
    `INSERT INTO camp_managers (location_id, user_id, granted_by, created_at)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE granted_by = VALUES(granted_by)`,
    [claim.locationId, claim.userId, reviewerId, now]
  );
  await db.query(
    `UPDATE camp_claims SET status = 'approved', reviewer_id = ?, review_note = ?, reviewed_at = ?
     WHERE id = ?`,
    [reviewerId, reviewNote ?? null, now, id]
  );
  return getClaimById(id);
}

export async function rejectClaim(
  id: string,
  reviewerId: string,
  reviewNote?: string
): Promise<CampClaim | null> {
  const db = getMysqlPool();
  const now = new Date();
  await db.query(
    `UPDATE camp_claims SET status = 'rejected', reviewer_id = ?, review_note = ?, reviewed_at = ?
     WHERE id = ? AND status = 'pending'`,
    [reviewerId, reviewNote ?? null, now, id]
  );
  return getClaimById(id);
}

// --- Managers -------------------------------------------------------------

export async function isCampManager(userId: string, locationId: string): Promise<boolean> {
  if (!isMysqlConfigured()) return false;
  try {
    const db = getMysqlPool();
    const [rows] = await db.query<ManagerRow[]>(
      "SELECT location_id FROM camp_managers WHERE user_id = ? AND location_id = ? LIMIT 1",
      [userId, locationId]
    );
    return rows.length > 0;
  } catch (err) {
    if (isMissingTableError(err)) return false;
    throw err;
  }
}

export async function listManagedLocationIds(userId: string): Promise<string[]> {
  if (!isMysqlConfigured()) return [];
  try {
    const db = getMysqlPool();
    const [rows] = await db.query<ManagerRow[]>(
      "SELECT location_id FROM camp_managers WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );
    return rows.map((r) => r.location_id);
  } catch (err) {
    if (isMissingTableError(err)) return [];
    throw err;
  }
}

// --- New camp-owned elephants ---------------------------------------------

export async function createCampElephant(input: {
  locationId: string;
  locationName: string;
  country: string;
  category: ElephantRecord["category"];
  name: string;
  sex?: ElephantRecord["sex"];
  status?: ElephantRecord["status"];
  subspecies?: ElephantRecord["subspecies"];
  birthDate?: string;
  ageYears?: number;
  origin?: ElephantRecord["origin"];
  management?: string;
  sourceUrl: string;
}): Promise<{ id: string }> {
  const db = getMysqlPool();
  const id = `camp_${randomUUID().replace(/-/g, "").slice(0, 24)}`;
  const now = new Date();

  await db.query<ResultSetHeader>(
    `INSERT INTO elephants
       (id, name, sex, status, species, subspecies, birth_date, age_years, origin,
        location_id, location_name, country, category, management, source_url, source, synced_at)
     VALUES (?, ?, ?, ?, 'asian', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'camp', ?)`,
    [
      id,
      input.name,
      input.sex ?? "unknown",
      input.status ?? "living",
      input.subspecies ?? "unknown",
      input.birthDate || null,
      input.ageYears ?? null,
      input.origin ?? "unknown",
      input.locationId,
      input.locationName,
      input.country,
      input.category,
      input.management || null,
      input.sourceUrl,
      now,
    ]
  );

  return { id };
}
