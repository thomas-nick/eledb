export const ELEPHANT_SE_BASE = "https://www.elephant.se";

/** Optimized search terms for elephant.se's location/individual index by country */
const countrySearchQueries: Record<string, string> = {
  Thailand: "Thailand",
  Cambodia: "Cambodia",
  Nepal: "Nepal",
  India: "India Asian elephant",
  Laos: "Laos",
  Indonesia: "Sumatra elephant",
  "Sri Lanka": "Sri Lanka elephant",
  Vietnam: "Vietnam elephant",
};

export function elephantSeSearchUrl(query: string): string {
  return `${ELEPHANT_SE_BASE}/search.php?lang=en&q=${encodeURIComponent(query)}`;
}

export function elephantSeCountryUrl(country: string): string {
  return elephantSeSearchUrl(countrySearchQueries[country] ?? country);
}

export function elephantSeFacilityUrl(sanctuary: {
  name: string;
  country: string;
  region?: string;
  elephantSeQuery?: string;
}): string {
  const query =
    sanctuary.elephantSeQuery ??
    `${sanctuary.name} ${sanctuary.country}`;
  return elephantSeSearchUrl(query);
}

export function elephantSeDatabaseUrl(): string {
  return `${ELEPHANT_SE_BASE}/elephant_database.php`;
}

export function elephantSeAsianDatabaseUrl(): string {
  return `${ELEPHANT_SE_BASE}/asian_elephant_database.php?open=Living%20Elephant%20Species`;
}
