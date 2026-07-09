#!/usr/bin/env npx tsx
/**
 * Suggest elephant.se location_id mappings for sanctuary directory entries.
 * Usage: npx tsx --env-file=.env.local scripts/match-sanctuary-locations.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import type { RowDataPacket } from "mysql2";
import { sanctuaries } from "../src/data/sanctuaries";
import { sanctuaryLocationMap } from "../src/data/elephantSeLocations";
import { getMysqlPool, isMysqlConfigured } from "../src/lib/elephant-db";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

interface LocRow extends RowDataPacket {
  location_id: string;
  location_name: string;
  country: string;
  elephant_count: number;
}

function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function tokens(s: string): string[] {
  return norm(s).split(" ").filter((t) => t.length > 2);
}

function score(sanctuaryName: string, locationName: string): number {
  const a = tokens(sanctuaryName);
  const b = tokens(locationName);
  if (!a.length || !b.length) return 0;
  let overlap = 0;
  for (const t of a) if (b.includes(t)) overlap++;
  const nA = norm(sanctuaryName);
  const nB = norm(locationName);
  if (nA.includes(nB) || nB.includes(nA)) return 1;
  return overlap / Math.max(a.length, b.length);
}

async function main() {
  if (!isMysqlConfigured()) {
    console.error("MySQL not configured");
    process.exit(1);
  }

  const db = getMysqlPool();
  const [rows] = await db.query<LocRow[]>(`
    SELECT location_id, location_name, country, COUNT(*) AS elephant_count
    FROM elephants
    WHERE location_id IS NOT NULL AND location_id != ''
    GROUP BY location_id, location_name, country
    HAVING elephant_count > 0
    ORDER BY elephant_count DESC
  `);

  const unmapped = sanctuaries.filter((s) => !sanctuaryLocationMap[s.id]);
  console.log(`Unmapped sanctuaries: ${unmapped.length} / ${sanctuaries.length}\n`);

  const suggestions: {
    id: string;
    name: string;
    country: string;
    locationId: string;
    locationName: string;
    count: number;
    matchScore: number;
  }[] = [];

  for (const s of unmapped) {
    const countryRows = rows.filter((r) => r.country === s.country);
    let best: { row: LocRow; matchScore: number } | null = null;

    for (const row of countryRows) {
      const matchScore = score(s.name, row.location_name);
      if (matchScore >= 0.5 && (!best || matchScore > best.matchScore)) {
        best = { row, matchScore };
      }
    }

    if (best) {
      suggestions.push({
        id: s.id,
        name: s.name,
        country: s.country,
        locationId: best.row.location_id,
        locationName: best.row.location_name,
        count: best.row.elephant_count,
        matchScore: best.matchScore,
      });
    }
  }

  suggestions.sort((a, b) => b.count - a.count);

  for (const s of suggestions) {
    console.log(
      `  "${s.id}": "${s.locationId}",  // ${s.name} → ${s.locationName} (${s.count} elephants, score ${s.matchScore.toFixed(2)})`
    );
  }

  const noMatch = unmapped.filter((s) => !suggestions.find((x) => x.id === s.id));
  if (noMatch.length) {
    console.log(`\nNo confident match (${noMatch.length}):`);
    for (const s of noMatch) console.log(`  - ${s.id}: ${s.name} (${s.country})`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
