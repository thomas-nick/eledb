import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import type { RowDataPacket } from "mysql2/promise";
import type { UserRecord, UserRole } from "@/types/auth";
import { getMysqlPool, isMysqlConfigured } from "@/lib/elephant-db";

export const USERS_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NULL,
  name VARCHAR(255) NULL,
  image VARCHAR(512) NULL,
  provider ENUM('credentials', 'google') NOT NULL DEFAULT 'credentials',
  role ENUM('user', 'moderator', 'admin') NOT NULL DEFAULT 'user',
  created_at DATETIME NOT NULL,
  UNIQUE KEY uq_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

interface UserRow extends RowDataPacket {
  id: string;
  email: string;
  password_hash: string | null;
  name: string | null;
  image: string | null;
  provider: UserRecord["provider"];
  role: UserRole;
  created_at: Date | string;
}

function rowToUser(row: UserRow): UserRecord {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash ?? undefined,
    name: row.name ?? undefined,
    image: row.image ?? undefined,
    provider: row.provider,
    role: row.role,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : new Date(row.created_at).toISOString(),
  };
}

function adminEmails(): Set<string> {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  );
}

function resolveRole(email: string, requested?: UserRole): UserRole {
  if (adminEmails().has(email.toLowerCase())) return "admin";
  return requested ?? "user";
}

export async function migrateAuthSchema(): Promise<void> {
  const db = getMysqlPool();
  await db.query(USERS_SCHEMA_SQL);
}

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  if (!isMysqlConfigured()) return null;
  const db = getMysqlPool();
  const [rows] = await db.query<UserRow[]>(
    "SELECT * FROM users WHERE email = ? LIMIT 1",
    [email.toLowerCase()]
  );
  return rows[0] ? rowToUser(rows[0]) : null;
}

export async function getUserById(id: string): Promise<UserRecord | null> {
  if (!isMysqlConfigured()) return null;
  const db = getMysqlPool();
  const [rows] = await db.query<UserRow[]>("SELECT * FROM users WHERE id = ? LIMIT 1", [id]);
  return rows[0] ? rowToUser(rows[0]) : null;
}

export async function createCredentialsUser(input: {
  email: string;
  password: string;
  name?: string;
}): Promise<UserRecord> {
  const db = getMysqlPool();
  const email = input.email.toLowerCase().trim();
  const existing = await getUserByEmail(email);
  if (existing) throw new Error("Email already registered");

  const id = randomUUID();
  const passwordHash = await bcrypt.hash(input.password, 12);
  const role = resolveRole(email);
  const now = new Date();

  await db.query(
    `INSERT INTO users (id, email, password_hash, name, provider, role, created_at)
     VALUES (?, ?, ?, ?, 'credentials', ?, ?)`,
    [id, email, passwordHash, input.name ?? null, role, now]
  );

  return {
    id,
    email,
    passwordHash,
    name: input.name,
    provider: "credentials",
    role,
    createdAt: now.toISOString(),
  };
}

export async function upsertOAuthUser(input: {
  email: string;
  name?: string | null;
  image?: string | null;
}): Promise<UserRecord> {
  const db = getMysqlPool();
  const email = input.email.toLowerCase().trim();
  const existing = await getUserByEmail(email);

  if (existing) {
    await db.query(
      `UPDATE users SET name = COALESCE(?, name), image = COALESCE(?, image), provider = 'google'
       WHERE id = ?`,
      [input.name ?? null, input.image ?? null, existing.id]
    );
    return (await getUserById(existing.id))!;
  }

  const id = randomUUID();
  const role = resolveRole(email);
  const now = new Date();

  await db.query(
    `INSERT INTO users (id, email, password_hash, name, image, provider, role, created_at)
     VALUES (?, ?, NULL, ?, ?, 'google', ?, ?)`,
    [id, email, input.name ?? null, input.image ?? null, role, now]
  );

  return {
    id,
    email,
    name: input.name ?? undefined,
    image: input.image ?? undefined,
    provider: "google",
    role,
    createdAt: now.toISOString(),
  };
}

export async function verifyCredentials(
  email: string,
  password: string
): Promise<UserRecord | null> {
  const user = await getUserByEmail(email);
  if (!user?.passwordHash) return null;
  const valid = await bcrypt.compare(password, user.passwordHash);
  return valid ? user : null;
}
