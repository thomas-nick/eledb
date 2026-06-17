import type { RowDataPacket } from "mysql2";
import { getMysqlPool } from "../../src/lib/elephant-db";
import { manualElephantIdOverrides } from "../../src/data/sanctuaryImportOverrides";

interface ElephantNameRow extends RowDataPacket {
  id: string;
  name: string;
  location_id: string | null;
}

export function normalizeMatchName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function compact(name: string): string {
  return normalizeMatchName(name).replace(/\s+/g, "");
}

function nameVariants(name: string): string[] {
  const variants = new Set<string>();
  variants.add(normalizeMatchName(name));
  variants.add(compact(name));
  const paren = name.match(/\(([^)]+)\)/);
  if (paren?.[1]) {
    variants.add(normalizeMatchName(paren[1]));
    variants.add(compact(paren[1]));
  }
  return [...variants].filter(Boolean);
}

function variantsMatch(a: string, b: string): boolean {
  const va = nameVariants(a);
  const vb = nameVariants(b);
  for (const x of va) {
    for (const y of vb) {
      if (x === y) return true;
      if (x.length >= 4 && y.length >= 4 && (x.includes(y) || y.includes(x))) return true;
    }
  }
  return false;
}

function tokenScore(a: string, b: string): number {
  const ta = new Set(normalizeMatchName(a).split(" ").filter((t) => t.length > 1));
  const tb = new Set(normalizeMatchName(b).split(" ").filter((t) => t.length > 1));
  if (!ta.size || !tb.size) return 0;
  let overlap = 0;
  for (const t of ta) if (tb.has(t)) overlap++;
  return overlap / Math.max(ta.size, tb.size);
}

export async function matchElephantId(options: {
  displayName: string;
  source: string;
  slug: string;
  locationId: string;
  country?: string;
}): Promise<string | undefined> {
  const overrideKey = `${options.source}:${options.slug}`;
  if (overrideKey in manualElephantIdOverrides) {
    const id = manualElephantIdOverrides[overrideKey];
    return id || undefined;
  }

  const nameKey = `${options.source}:${normalizeMatchName(options.displayName)}`;
  if (nameKey in manualElephantIdOverrides) {
    const id = manualElephantIdOverrides[nameKey];
    return id || undefined;
  }

  const db = getMysqlPool();
  const [atLocation] = await db.query<ElephantNameRow[]>(
    `SELECT id, name, location_id FROM elephants WHERE location_id = ?`,
    [options.locationId]
  );

  let candidates = atLocation;
  if (options.country) {
    const [inCountry] = await db.query<ElephantNameRow[]>(
      `SELECT id, name, location_id FROM elephants WHERE country = ?`,
      [options.country]
    );
    const seen = new Set(candidates.map((r) => r.id));
    for (const row of inCountry) {
      if (!seen.has(row.id)) candidates.push(row);
    }
  }

  const target = normalizeMatchName(options.displayName);
  const targetCompact = compact(options.displayName);

  let best: { id: string; score: number } | null = null;

  for (const row of candidates) {
    if (variantsMatch(options.displayName, row.name)) {
      return row.id;
    }

    const n = normalizeMatchName(row.name);
    const nCompact = compact(row.name);

    if (n === target || nCompact === targetCompact) {
      return row.id;
    }

    const score = tokenScore(options.displayName, row.name);
    const locationBonus = row.location_id === options.locationId ? 0.15 : 0;
    const total = score + locationBonus;

    if (total >= 0.85 && (!best || total > best.score)) {
      best = { id: row.id, score: total };
    }
  }

  return best?.id;
}
