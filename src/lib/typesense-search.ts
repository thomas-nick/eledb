import {
  getTypesenseClient,
  isTypesenseConfigured,
} from "@/lib/typesense";
import {
  buildGlobalMultiSearch,
  mapGlobalMultiSearchResponse,
} from "@/lib/typesense-queries";
import { searchElephants } from "@/lib/elephants";
import { listLocations } from "@/lib/locations";
import { isUnnamedRecord } from "@/lib/elephantNames";

export interface GlobalSearchElephant {
  id: string;
  name: string;
  locationName: string;
  country: string;
  status: string;
  isNamed: boolean;
}

export interface GlobalSearchCamp {
  id: string;
  name: string;
  displayName: string;
  country: string;
  category: string;
  elephantCount: number;
}

export interface GlobalSearchResult {
  query: string;
  elephants: GlobalSearchElephant[];
  camps: GlobalSearchCamp[];
  elephantTotal: number;
  campTotal: number;
  source: "typesense" | "browser" | "fallback";
}

const EMPTY: Omit<GlobalSearchResult, "query" | "source"> = {
  elephants: [],
  camps: [],
  elephantTotal: 0,
  campTotal: 0,
};

async function globalSearchTypesense(
  query: string,
  perCategory: number
): Promise<GlobalSearchResult> {
  const client = getTypesenseClient();
  const response = await client.multiSearch.perform(buildGlobalMultiSearch(query, perCategory));
  return mapGlobalMultiSearchResponse(query, response.results, "typesense");
}

async function globalSearchFallback(
  query: string,
  perCategory: number
): Promise<GlobalSearchResult> {
  const [elephantResult, locationResult] = await Promise.all([
    searchElephants({ q: query, namedOnly: true, perPage: perCategory, page: 1 }),
    listLocations({ q: query, limit: perCategory }),
  ]);

  return {
    query,
    elephants: elephantResult.elephants.map((e) => ({
      id: e.id,
      name: e.name,
      locationName: e.locationName,
      country: e.country,
      status: e.status,
      isNamed: !isUnnamedRecord(e),
    })),
    camps: locationResult.locations.map((l) => ({
      id: l.id,
      name: l.name,
      displayName: l.displayName,
      country: l.country,
      category: l.category,
      elephantCount: l.elephantCount,
    })),
    elephantTotal: elephantResult.total,
    campTotal: locationResult.total,
    source: "fallback",
  };
}

/**
 * Federated typeahead across elephants + camps for the global search palette.
 * Uses a single Typesense multi-search request; falls back to MySQL/seed.
 */
export async function globalSearch(
  query: string,
  perCategory = 5
): Promise<GlobalSearchResult> {
  const q = query.trim();
  if (!q) return { query: "", source: "fallback", ...EMPTY };

  if (isTypesenseConfigured()) {
    try {
      return await globalSearchTypesense(q, perCategory);
    } catch {
      // fall through
    }
  }
  return globalSearchFallback(q, perCategory);
}
