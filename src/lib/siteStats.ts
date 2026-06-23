import seedData from "@/data/elephantsSeed.json";
import { countryMetaList } from "@/data/countryMeta";
import { getSiteStatsMysql, isMysqlConfigured, type SiteStats } from "@/lib/elephant-db";
import { isUnnamedRecord } from "@/lib/elephantNames";
import type { ElephantRecord } from "@/types/elephant";

const seedElephants = seedData as ElephantRecord[];

export type { SiteStats };

function computeLocalSiteStats(): SiteStats {
  const campIds = new Set<string>();
  const countries = new Set<string>();
  for (const e of seedElephants) {
    if (e.locationId) campIds.add(e.locationId);
    if (e.country) countries.add(e.country);
  }
  return {
    total: seedElephants.length,
    living: seedElephants.filter((e) => e.status === "living").length,
    named: seedElephants.filter((e) => !isUnnamedRecord(e)).length,
    campCount: campIds.size,
    countryCount: countries.size || countryMetaList.length,
  };
}

/** Global database counts for the homepage dashboard. */
export async function getSiteStats(): Promise<SiteStats & { source: "mysql" | "local" }> {
  if (isMysqlConfigured()) {
    try {
      const stats = await getSiteStatsMysql();
      return { ...stats, source: "mysql" };
    } catch {
      return { ...computeLocalSiteStats(), source: "local" };
    }
  }
  return { ...computeLocalSiteStats(), source: "local" };
}

export function formatStat(n: number): string {
  return n.toLocaleString("en-US");
}
