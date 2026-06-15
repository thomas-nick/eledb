/** Links our sanctuary directory to elephant.se location IDs */
export const sanctuaryLocationMap: Record<string, string> = {
  "phuket-elephant-sanctuary": "2665",
  "elephant-nature-park": "1003",
  "patara-elephant": "4113",
  "boon-lott": "1103",
  "golden-triangle": "4147",
};

export function getLocationIdForSanctuary(sanctuaryId: string): string | undefined {
  return sanctuaryLocationMap[sanctuaryId];
}

export function getSanctuaryIdsForLocation(locationId: string): string[] {
  return Object.entries(sanctuaryLocationMap)
    .filter(([, id]) => id === locationId)
    .map(([sanctuaryId]) => sanctuaryId);
}
