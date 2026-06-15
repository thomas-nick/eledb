import {
  extractElephantIdsFromHtml,
  extractSearchLocationIdsFromHtml,
  parseLocationCountry,
} from "./parse";
import {
  locationPageUrl,
  sleep,
  THAILAND_COUNTRY,
  THAILAND_SEARCH_URL,
} from "./types";

export async function fetchText(
  url: string,
  fetchImpl: typeof fetch = fetch
): Promise<string> {
  const res = await fetchImpl(url, {
    headers: {
      "User-Agent": "AsianElephant-Sync/1.0 (CC-BY-4.0; +https://mahoot.xyz)",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

/** Discover elephant IDs for a country via search index + per-location pages. */
export async function discoverCountryElephantIds(
  options: {
    searchUrl: string;
    country: string;
    delayMs: number;
    maxLocations?: number;
    fetchImpl?: typeof fetch;
    onLocation?: (current: number, total: number, locationId: string) => void;
  }
): Promise<{ elephantIds: string[]; locationIds: string[] }> {
  const { searchUrl, delayMs, maxLocations = 0, fetchImpl = fetch, onLocation } = options;
  const fetchPage = (url: string) => fetchText(url, fetchImpl);

  console.log(`Discovering locations via ${searchUrl}...`);
  const searchHtml = await fetchPage(searchUrl);
  const allLocationIds = extractSearchLocationIdsFromHtml(searchHtml);
  const locationIds =
    maxLocations > 0 ? allLocationIds.slice(0, maxLocations) : allLocationIds;
  const elephantIds = new Set<string>();
  const confirmedLocationIds: string[] = [];

  console.log(`Search index: ${locationIds.length} candidate locations`);

  for (let i = 0; i < locationIds.length; i++) {
    const locationId = locationIds[i];
    onLocation?.(i + 1, locationIds.length, locationId);
    await sleep(delayMs);
    const html = await fetchPage(locationPageUrl(locationId));
    const country = parseLocationCountry(html);
    if (country !== options.country) continue;
    confirmedLocationIds.push(locationId);
    for (const id of extractElephantIdsFromHtml(html)) elephantIds.add(id);
  }

  console.log(
    `Confirmed ${confirmedLocationIds.length} locations in ${options.country} (${elephantIds.size} elephants)`
  );

  return {
    elephantIds: [...elephantIds],
    locationIds: confirmedLocationIds,
  };
}

export function discoverThailandElephantIds(options: {
  delayMs: number;
  maxLocations?: number;
  fetchImpl?: typeof fetch;
  onLocation?: (current: number, total: number, locationId: string) => void;
}) {
  return discoverCountryElephantIds({
    ...options,
    searchUrl: THAILAND_SEARCH_URL,
    country: THAILAND_COUNTRY,
  });
}
