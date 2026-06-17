import seedData from "@/data/elephantsSeed.json";
import {
  getLocationMysql,
  isMysqlConfigured,
  listLocationsMysql,
} from "@/lib/elephant-db";
import { normalizeLocationDisplayName } from "@/lib/locationDisplay";
import { getSanctuaryIdsForLocation } from "@/data/elephantSeLocations";
import type { ElephantRecord } from "@/types/elephant";
import type { LocationListResult, LocationSummary } from "@/types/location";

const seedElephants = seedData as ElephantRecord[];

function buildLocalLocations(
  options: {
    country?: string;
    category?: string;
    q?: string;
    limit?: number;
    offset?: number;
  }
): LocationListResult {
  const groups = new Map<string, LocationSummary>();

  for (const e of seedElephants) {
    if (!e.locationId) continue;
    if (options.country && e.country !== options.country) continue;
    if (options.category && e.category !== options.category) continue;
    if (options.q && !e.locationName.toLowerCase().includes(options.q.toLowerCase())) continue;

    const existing = groups.get(e.locationId);
    if (existing) {
      existing.elephantCount++;
      if (e.status === "living") existing.livingCount++;
    } else {
      groups.set(e.locationId, {
        id: e.locationId,
        name: e.locationName,
        displayName: normalizeLocationDisplayName(e.locationName),
        country: e.country,
        category: e.category,
        elephantCount: 1,
        livingCount: e.status === "living" ? 1 : 0,
        sanctuaryIds: getSanctuaryIdsForLocation(e.locationId),
      });
    }
  }

  const sorted = [...groups.values()].sort((a, b) => b.elephantCount - a.elephantCount);
  const offset = options.offset ?? 0;
  const limit = options.limit ?? 30;

  return {
    locations: sorted.slice(offset, offset + limit),
    total: sorted.length,
    source: "local",
  };
}

export async function listLocations(options: {
  country?: string;
  category?: string;
  q?: string;
  limit?: number;
  offset?: number;
}): Promise<LocationListResult> {
  if (isMysqlConfigured()) {
    try {
      return await listLocationsMysql(options);
    } catch {
      return buildLocalLocations(options);
    }
  }
  return buildLocalLocations(options);
}

export async function getLocation(locationId: string): Promise<LocationSummary | null> {
  if (isMysqlConfigured()) {
    try {
      const loc = await getLocationMysql(locationId);
      if (loc) return loc;
    } catch {
      // fall through
    }
  }
  const match = seedElephants.filter((e) => e.locationId === locationId);
  if (match.length === 0) return null;
  const first = match[0];
  return {
    id: locationId,
    name: first.locationName,
    displayName: normalizeLocationDisplayName(first.locationName),
    country: first.country,
    category: first.category,
    elephantCount: match.length,
    livingCount: match.filter((e) => e.status === "living").length,
    sanctuaryIds: getSanctuaryIdsForLocation(locationId),
  };
}
