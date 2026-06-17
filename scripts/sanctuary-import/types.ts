import type { ElephantEnrichment, EnrichmentSource } from "../../src/types/enrichment";

export interface DiscoveredProfile {
  slug: string;
  url: string;
}

export interface SanctuaryImportSource {
  id: EnrichmentSource;
  label: string;
  locationId: string;
  /** Optional secondary match scope when elephants span multiple elephant.se locations */
  matchCountry?: string;
  listingUrl: string;
  photoCredit: string;
  discoverProfiles: () => Promise<DiscoveredProfile[]>;
  parseProfile: (html: string, profile: DiscoveredProfile) => Omit<
    ElephantEnrichment,
    "id" | "source" | "elephantId" | "syncedAt"
  >;
}

export interface ImportResult {
  source: EnrichmentSource;
  records: ElephantEnrichment[];
  linked: number;
  orphans: string[];
}
