import seedData from "@/data/elephantsSeed.json";
import {
  getElephantByIdMysql,
  getHerdMatesMysql,
  getOffspringMysql,
  isMysqlConfigured,
  searchElephantsMysql,
} from "@/lib/elephant-db";
import { enrichSearchResults } from "@/lib/elephantEnrichments";
import type {
  ElephantRecord,
  ElephantSearchParams,
  ElephantSearchResult,
  ElephantSort,
} from "@/types/elephant";
import { isUnnamedRecord } from "@/lib/elephantNames";

const seedElephants = seedData as ElephantRecord[];

function facetCounts(
  records: ElephantRecord[],
  key: keyof ElephantRecord
): { value: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const record of records) {
    const value = String(record[key] ?? "");
    if (!value || value === "unknown") continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count);
}

function filterLocal(
  records: ElephantRecord[],
  params: ElephantSearchParams
): ElephantRecord[] {
  const q = params.q?.toLowerCase().trim();
  return records.filter((record) => {
    if (params.country && record.country !== params.country) return false;
    if (params.status && record.status !== params.status) return false;
    if (params.sex && record.sex !== params.sex) return false;
    if (params.subspecies && record.subspecies !== params.subspecies) return false;
    if (params.locationId && record.locationId !== params.locationId) return false;
    if (params.locationName && record.locationName !== params.locationName) return false;
    if (params.category && record.category !== params.category) return false;
    if (params.namedOnly && isUnnamedRecord(record)) return false;
    if (params.hasStory) return false;
    if (!q) return true;
    const haystack = [
      record.name,
      record.locationName,
      record.country,
      record.fatherName,
      record.motherName,
      record.chipId,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

function sortLocal(records: ElephantRecord[], sort?: ElephantSort): ElephantRecord[] {
  const list = [...records];
  switch (sort) {
    case "age":
      return list.sort((a, b) => (b.ageYears ?? 0) - (a.ageYears ?? 0));
    case "updated":
      return list.sort(
        (a, b) => new Date(b.syncedAt).getTime() - new Date(a.syncedAt).getTime()
      );
    default:
      return list.sort((a, b) => a.name.localeCompare(b.name));
  }
}

function buildLocalFacets(records: ElephantRecord[]) {
  return {
    countries: facetCounts(records, "country"),
    statuses: facetCounts(records, "status"),
    categories: facetCounts(records, "category"),
    subspecies: facetCounts(records, "subspecies"),
    locations: facetCounts(records, "locationName"),
  };
}

function searchLocal(params: ElephantSearchParams): ElephantSearchResult {
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 24;
  const filtered = sortLocal(filterLocal(seedElephants, params), params.sort);
  const start = (page - 1) * perPage;

  return {
    elephants: filtered.slice(start, start + perPage),
    total: filtered.length,
    page,
    perPage,
    facets: buildLocalFacets(seedElephants),
    source: "local",
  };
}

export async function searchElephants(
  params: ElephantSearchParams
): Promise<ElephantSearchResult> {
  if (isMysqlConfigured()) {
    const result = await searchElephantsMysql(params);
    return {
      ...result,
      elephants: await enrichSearchResults(result.elephants),
    };
  }
  return searchLocal(params);
}

export async function getElephantById(id: string): Promise<ElephantRecord | null> {
  if (isMysqlConfigured()) {
    try {
      const record = await getElephantByIdMysql(id);
      if (record) return record;
    } catch {
      // fall through
    }
  }
  return seedElephants.find((e) => e.id === id) ?? null;
}

export async function getOffspring(id: string): Promise<ElephantRecord[]> {
  if (isMysqlConfigured()) {
    try {
      return await getOffspringMysql(id);
    } catch {
      return [];
    }
  }
  return seedElephants.filter((e) => e.fatherId === id || e.motherId === id);
}

export async function getHerdMates(
  locationId: string,
  excludeId: string
): Promise<ElephantRecord[]> {
  if (isMysqlConfigured()) {
    try {
      return await getHerdMatesMysql(locationId, excludeId);
    } catch {
      return [];
    }
  }
  return seedElephants.filter(
    (e) => e.locationId === locationId && e.id !== excludeId && e.status === "living"
  );
}

export function getElephantsAtLocation(locationId: string): ElephantRecord[] {
  return seedElephants.filter((e) => e.locationId === locationId);
}
