import seedData from "@/data/elephantsSeed.json";
import { articles } from "@/data/articles";
import { corridors } from "@/data/corridors";
import { hotspots } from "@/data/hotspots";
import { rangeStates } from "@/data/rangeStates";
import { sanctuaries } from "@/data/sanctuaries";
import {
  getCountryMeta,
  getCountryMetaByDbName,
  getAllCountrySlugs,
  countryMetaList,
  type CountryMeta,
} from "@/data/countryMeta";
import { getCountryStatsMysql, isMysqlConfigured } from "@/lib/elephant-db";
import { searchElephants } from "@/lib/elephants";
import { listLocations } from "@/lib/locations";
import { isUnnamedRecord } from "@/lib/elephantNames";
import type { ElephantRecord } from "@/types/elephant";
import type { Article } from "@/data/articles";
import type { Corridor } from "@/data/corridors";
import type { Hotspot } from "@/data/hotspots";
import type { Sanctuary } from "@/data/sanctuaries";
import type { RangeState } from "@/data/rangeStates";
import type { LocationSummary } from "@/types/location";

const seedElephants = seedData as ElephantRecord[];

export interface CountryDbStats {
  total: number;
  living: number;
  deceased: number;
  named: number;
  campCount: number;
}

export interface CountryPageData {
  meta: CountryMeta;
  range: RangeState | null;
  stats: CountryDbStats;
  featuredElephants: ElephantRecord[];
  camps: LocationSummary[];
  hotspots: Hotspot[];
  corridors: Corridor[];
  sanctuaries: Sanctuary[];
  articles: Article[];
  source: "mysql" | "local";
}

function computeLocalCountryStats(dbCountry: string): CountryDbStats {
  const records = seedElephants.filter((e) => e.country === dbCountry);
  const campIds = new Set<string>();
  for (const e of records) {
    if (e.locationId) campIds.add(e.locationId);
  }
  return {
    total: records.length,
    living: records.filter((e) => e.status === "living").length,
    deceased: records.filter((e) => e.status === "deceased").length,
    named: records.filter((e) => !isUnnamedRecord(e)).length,
    campCount: campIds.size,
  };
}

async function getCountryDbStats(dbCountry: string): Promise<CountryDbStats> {
  if (isMysqlConfigured()) {
    try {
      return await getCountryStatsMysql(dbCountry);
    } catch {
      return computeLocalCountryStats(dbCountry);
    }
  }
  return computeLocalCountryStats(dbCountry);
}

export async function getCountryPageData(slug: string): Promise<CountryPageData | null> {
  const meta = getCountryMeta(slug);
  if (!meta) return null;

  const range = rangeStates.find((s) => s.id === slug) ?? null;
  const dbCountry = meta.dbCountry;

  const [stats, elephantResult, campsResult] = await Promise.all([
    getCountryDbStats(dbCountry),
    searchElephants({
      country: dbCountry,
      sort: "updated",
      perPage: 8,
      namedOnly: true,
    }),
    listLocations({ country: dbCountry, category: "camp", limit: 6 }),
  ]);

  const countryHotspots = hotspots.filter((h) => h.countryId === slug);
  const countryCorridors = corridors.filter((c) =>
    c.countries.some((name) => name === dbCountry || name === meta.title)
  );
  const countrySanctuaries = sanctuaries.filter((s) => s.country === dbCountry);
  const countryArticles = articles.filter((a) => meta.articleSlugs.includes(a.slug));

  return {
    meta,
    range,
    stats,
    featuredElephants: elephantResult.elephants,
    camps: campsResult.locations,
    hotspots: countryHotspots,
    corridors: countryCorridors,
    sanctuaries: countrySanctuaries.slice(0, 6),
    articles: countryArticles,
    source: elephantResult.source,
  };
}

export interface CountryIndexItem {
  meta: CountryMeta;
  range: RangeState | null;
  stats: CountryDbStats;
}

export async function getCountryIndexData(): Promise<CountryIndexItem[]> {
  const items = await Promise.all(
    countryMetaList.map(async (meta) => {
      const stats = await getCountryDbStats(meta.dbCountry);
      const range = rangeStates.find((s) => s.id === meta.slug) ?? null;
      return { meta, range, stats };
    })
  );
  return items.sort((a, b) => b.stats.total - a.stats.total);
}

export {
  getCountryMeta,
  getCountryMetaByDbName,
  getAllCountrySlugs,
  countryMetaList,
};

export function countryHubHref(slug: string): string {
  return `/countries/${slug}`;
}

export function countryHubHrefFromDbName(dbCountry: string): string | undefined {
  const meta = getCountryMetaByDbName(dbCountry);
  return meta ? countryHubHref(meta.slug) : undefined;
}
