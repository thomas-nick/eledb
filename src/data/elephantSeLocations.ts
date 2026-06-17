/**
 * Links curated sanctuary directory entries to elephant.se location_id values.
 * IDs verified against synced MySQL location_name groupings.
 */
export const sanctuaryLocationMap: Record<string, string> = {
  // Thailand
  "elephant-nature-park": "174",
  "patara-elephant": "1251",
  "boon-lott": "1562",
  "golden-triangle": "1282",
  "anantara-golden-triangle": "1282",
  "phuket-elephant-sanctuary": "2665",
  "green-elephant-phuket": "2665",
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
  "ejs-phuket": "3962",
  "yok-don-elephant-project": "2169",

  // Laos & Cambodia
  "laos-elephant-conservation-centre": "2077",
  "mandalao-laos": "2753",
  "mekong-elephant-park": "2791",
  "kulen-elephant-forest": "2975",
  "cambodia-elephant-sanctuary-sr": "1362",

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
