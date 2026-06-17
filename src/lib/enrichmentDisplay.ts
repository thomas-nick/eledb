import type { EnrichmentSource } from "@/types/enrichment";

export const enrichmentSourceLabels: Record<EnrichmentSource, string> = {
  "elephant-nature-park": "Elephant Nature Park",
  "wildlife-sos": "Wildlife SOS",
  "phuket-elephant-sanctuary": "Phuket Elephant Sanctuary",
};

export function enrichmentSourceLabel(source: EnrichmentSource): string {
  return enrichmentSourceLabels[source] ?? source;
}

export function enrichmentSourceHostname(sourceUrl: string): string {
  try {
    return new URL(sourceUrl).hostname.replace(/^www\./, "");
  } catch {
    return sourceUrl;
  }
}
