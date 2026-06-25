import seedData from "@/data/elephantsSeed.json";
import {
  getLocationMysql,
  isMysqlConfigured,
  listLocationsMysql,
} from "@/lib/elephant-db";
import { getCampProfile } from "@/lib/camp-db";
import { normalizeLocationDisplayName } from "@/lib/locationDisplay";
import { isUnnamedRecord } from "@/lib/elephantNames";
import { getSanctuaryIdsForLocation } from "@/data/elephantSeLocations";
import type { ElephantRecord } from "@/types/elephant";
import type {
  LocationListResult,
  LocationProfile,
  LocationSummary,
} from "@/types/location";

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
      if (!isUnnamedRecord(e)) existing.namedCount++;
    } else {
      groups.set(e.locationId, {
        id: e.locationId,
        name: e.locationName,
        displayName: normalizeLocationDisplayName(e.locationName),
        country: e.country,
        category: e.category,
        elephantCount: 1,
        livingCount: e.status === "living" ? 1 : 0,
        namedCount: isUnnamedRecord(e) ? 0 : 1,
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

async function attachProfile(location: LocationSummary): Promise<LocationSummary> {
  if (!isMysqlConfigured()) return location;
  try {
    const profile = await getCampProfile(location.id);
    if (!profile) return location;
    const mapped: LocationProfile = {
      description: profile.description,
      website: profile.website,
      contactEmail: profile.contactEmail,
      phone: profile.phone,
      address: profile.address,
      welfareNotes: profile.welfareNotes,
      heroPhotoUrl: profile.heroPhotoUrl,
      updatedAt: profile.updatedAt,
    };
    return { ...location, profile: mapped, claimed: true };
  } catch {
    return location;
  }
}

export async function getLocation(locationId: string): Promise<LocationSummary | null> {
  if (isMysqlConfigured()) {
    try {
      const loc = await getLocationMysql(locationId);
      if (loc) return attachProfile(loc);
    } catch {
      // fall through
    }
  }
  const match = seedElephants.filter((e) => e.locationId === locationId);
  if (match.length === 0) return null;
  const first = match[0];
  const base: LocationSummary = {
    id: locationId,
    name: first.locationName,
    displayName: normalizeLocationDisplayName(first.locationName),
    country: first.country,
    category: first.category,
    elephantCount: match.length,
    livingCount: match.filter((e) => e.status === "living").length,
    namedCount: match.filter((e) => !isUnnamedRecord(e)).length,
    sanctuaryIds: getSanctuaryIdsForLocation(locationId),
  };
  return attachProfile(base);
}
