/** Shorten long elephant.se facility names for chips and cards. */
export function normalizeLocationDisplayName(name: string, maxLen = 42): string {
  const trimmed = name
    .replace(/\s+/g, " ")
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .trim();
  if (trimmed.length <= maxLen) return trimmed;
  return `${trimmed.slice(0, maxLen - 1).trim()}…`;
}

export function locationElephantSeUrl(locationId: string): string {
  return `https://www.elephant.se/location2.php?location_id=${locationId}`;
}
