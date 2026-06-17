export type EnrichmentSource =
  | "elephant-nature-park"
  | "wildlife-sos"
  | "phuket-elephant-sanctuary";

export interface EnrichmentPhoto {
  url: string;
  credit?: string;
}

export interface ElephantEnrichment {
  id: string;
  elephantId?: string;
  source: EnrichmentSource;
  sourceSlug: string;
  sourceUrl: string;
  displayName: string;
  localName?: string;
  facility?: string;
  locationId?: string;
  sex?: "male" | "female" | "unknown";
  birthDate?: string;
  teaser?: string;
  story?: string;
  rescueDate?: string;
  rescueLocation?: string;
  herdFriends?: string;
  photos?: EnrichmentPhoto[];
  syncedAt: string;
}
