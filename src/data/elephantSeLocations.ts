/**
 * Links curated sanctuary directory entries to elephant.se location_id values.
 * IDs verified against synced MySQL location_name groupings.
 *
 * Only map when the sanctuary is the same physical facility as the elephant.se
 * location. Do NOT map similarly named but distinct camps to the same ID —
 * that makes unrelated places show the same herd.
 */
export const sanctuaryLocationMap: Record<string, string> = {
  // Thailand
  "elephant-nature-park": "174",
  "patara-elephant": "1251",
  "boon-lott": "1562",
  // Same facility: GTAEF / Anantara Golden Triangle Elephant Camp
  "golden-triangle": "1282",
  "anantara-golden-triangle": "1282",
  "phuket-elephant-sanctuary": "2665",
  // green-elephant-phuket + phuket-elephant-conservation are DIFFERENT camps —
  // do not map them to 2665 (Phuket Elephant Sanctuary).
  "wildlife-friends-thailand": "2010",
  "hidden-forest-reserve": "3986",
  "samui-elephant-sanctuary": "2782",
  "elephant-valley-project": "2638",
  "baan-chang": "1918",
  "following-giants-lanta": "2288",
  "burm-emilys": "2470",
  "somboon-legacy": "3128",
  "elephant-hills": "1973",
  "elephant-haven": "3193",
  "elephant-forest-phitsanulok": "2916",
  "mason-elephant-park": "940",
  "phang-nga-elephant-park": "2759",
  "ao-nang-elephant-sanctuary": "4023",
  "krabi-roaming": "4046",
  "gvi-chiang-mai": "1871",
  // EJS has separate camps; elephant.se only has a generic "Elephant Jungle Sanctuary"
  // record (#3962, 1 elephant). Keep Phuket only until per-camp IDs exist.
  "ejs-phuket": "3962",
  "yok-don-elephant-project": "2169",
  "thai-elephant-conservation-center": "529",
  "thai-elephant-home": "1921",
  "khao-sok-elephant-sanctuary": "4048",
  "phangan-elephant": "4072",
  "elephants-world": "2002",
  // phuket-elephant-care-* are separate sites; Siray (#4064) is not a confident match.

  // Laos & Cambodia
  "laos-elephant-conservation-centre": "2077",
  "mandalao-laos": "2753",
  "mekong-elephant-park": "2791",
  "kulen-elephant-forest": "2975",
  "cambodia-elephant-sanctuary-sr": "1362",
  "mondulkiri-project": "3015",
  "cambodia-wildlife-sanctuary": "2118",

  // Nepal & India
  "tiger-tops-tharu": "2763",
  "sapana-village": "2768",
  "wildlife-sos-india": "2627",
  "kaziranga-wildlife": "569",

  // Sri Lanka & Indonesia
  "pinnawala-orphanage": "43",
  "minneriya-safari": "3007",
  "way-kambas": "855",
};

/** Reverse lookup: location_id → sanctuary slugs (many-to-one allowed). */
export function getSanctuaryIdsForLocation(locationId: string): string[] {
  return Object.entries(sanctuaryLocationMap)
    .filter(([, id]) => id === locationId)
    .map(([sanctuaryId]) => sanctuaryId);
}

export function getLocationIdForSanctuary(sanctuaryId: string): string | undefined {
  return sanctuaryLocationMap[sanctuaryId];
}

export function hasCuratedSanctuary(locationId: string): boolean {
  return getSanctuaryIdsForLocation(locationId).length > 0;
}
