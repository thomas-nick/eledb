import type { ElephantPhoto } from "@/types/elephant";
import type { ElephantEnrichment } from "@/types/enrichment";
import {
  getEnrichmentByElephantIdMysql,
  isMysqlConfigured,
} from "@/lib/elephant-enrichment-db";
import { resolveElephantPhotoUrl } from "@/lib/elephantSe";

export async function getElephantEnrichment(
  elephantId: string
): Promise<ElephantEnrichment | null> {
  if (!isMysqlConfigured()) return null;
  try {
    return await getEnrichmentByElephantIdMysql(elephantId);
  } catch {
    return null;
  }
}

/** Community photos first, then elephant.se — deduped by resolved URL */
export function mergeProfilePhotos(
  elephantPhotos: ElephantPhoto[] | undefined,
  enrichment: ElephantEnrichment | null
): ElephantPhoto[] {
  const seen = new Set<string>();
  const merged: ElephantPhoto[] = [];

  const add = (url: string, credit?: string) => {
    const resolved = url.startsWith("http") ? url : resolveElephantPhotoUrl(url);
    if (seen.has(resolved)) return;
    seen.add(resolved);
    merged.push({ url: resolved, credit });
  };

  for (const p of enrichment?.photos ?? []) add(p.url, p.credit);
  for (const p of elephantPhotos ?? []) add(p.url, p.credit);

  return merged;
}
