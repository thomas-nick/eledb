import {
  ELEPHANTS_COLLECTION,
  LOCATIONS_COLLECTION,
} from "@/lib/typesense";
import type { TypesenseElephantDoc } from "@/lib/typesense-elephants";
import type {
  GlobalSearchCamp,
  GlobalSearchElephant,
  GlobalSearchResult,
} from "@/lib/typesense-search";

/** Shared multi-search params for federated typeahead (server + browser). */
export function buildGlobalMultiSearch(query: string, perCategory: number) {
  return {
    searches: [
      {
        collection: ELEPHANTS_COLLECTION,
        q: query,
        query_by: "name,location_name,country,chip_id,father_name,mother_name",
        query_by_weights: "8,5,2,4,1,1",
        filter_by: "is_named:=true",
        sort_by: "_text_match:desc,popularity_score:desc,name:asc",
        per_page: perCategory,
        page: 1,
      },
      {
        collection: LOCATIONS_COLLECTION,
        q: query,
        query_by: "name,display_name,country",
        query_by_weights: "5,5,1",
        sort_by: "_text_match:desc,elephant_count:desc",
        per_page: perCategory,
        page: 1,
      },
    ],
  };
}

interface LocationDoc {
  id: string;
  name: string;
  display_name?: string;
  country: string;
  category: string;
  elephant_count: number;
}

type MultiSearchHit<T> = { hits?: { document: T }[]; found?: number };

export function mapGlobalMultiSearchResponse(
  query: string,
  results: unknown[],
  source: GlobalSearchResult["source"]
): GlobalSearchResult {
  const [elephantRes, campRes] = results as [
    MultiSearchHit<TypesenseElephantDoc>,
    MultiSearchHit<LocationDoc>,
  ];

  const elephants: GlobalSearchElephant[] = (elephantRes.hits ?? []).map((h) => ({
    id: h.document.id,
    name: h.document.name,
    locationName: h.document.location_name,
    country: h.document.country,
    status: h.document.status,
    isNamed: h.document.is_named,
  }));

  const camps: GlobalSearchCamp[] = (campRes.hits ?? []).map((h) => ({
    id: h.document.id,
    name: h.document.name,
    displayName: h.document.display_name || h.document.name,
    country: h.document.country,
    category: h.document.category,
    elephantCount: h.document.elephant_count,
  }));

  return {
    query,
    elephants,
    camps,
    elephantTotal: elephantRes.found ?? elephants.length,
    campTotal: campRes.found ?? camps.length,
    source,
  };
}

/** Popularity score for search ranking (higher = more likely to surface). */
export function computePopularityScore(options: {
  isNamed: boolean;
  status: string;
  hasEnrichment: boolean;
  hasPhoto: boolean;
}): number {
  let score = 0;
  if (options.isNamed) score += 20;
  if (options.status === "living") score += 10;
  if (options.hasEnrichment) score += 50;
  if (options.hasPhoto) score += 30;
  return score;
}
