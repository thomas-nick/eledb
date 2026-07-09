import { sanctuaryLocationMap } from "@/data/elephantSeLocations";
import { getElephantCountsByLocationIds, isMysqlConfigured } from "@/lib/elephant-db";

export type SanctuaryElephantCounts = Record<string, number>;

/** Elephant.se record counts keyed by sanctuary directory id. */
export async function getSanctuaryElephantCounts(): Promise<SanctuaryElephantCounts> {
  const bySanctuary: SanctuaryElephantCounts = {};
  if (!isMysqlConfigured()) return bySanctuary;

  const locationIds = [...new Set(Object.values(sanctuaryLocationMap))];
  const byLocation = await getElephantCountsByLocationIds(locationIds);

  for (const [sanctuaryId, locationId] of Object.entries(sanctuaryLocationMap)) {
    bySanctuary[sanctuaryId] = byLocation[locationId] ?? 0;
  }

  return bySanctuary;
}
