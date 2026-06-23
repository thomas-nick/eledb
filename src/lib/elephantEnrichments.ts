import type { ElephantPhoto, ElephantRecord } from "@/types/elephant";
import type { ElephantEnrichment } from "@/types/enrichment";
import type { CommunityPhoto } from "@/types/contribution";
import { getCommunityPhotoSummaries } from "@/lib/contribution-db";
import {
  getEnrichmentByElephantIdMysql,
  getEnrichmentSummariesByElephantIdsMysql,
  isMysqlConfigured,
} from "@/lib/elephant-enrichment-db";
import { resolveElephantPhotoUrl } from "@/lib/elephantSe";

function resolvePhotoUrl(url: string): string {
  return url.startsWith("http") ? url : resolveElephantPhotoUrl(url);
}

/** Best cover photo for a list card: community -> enrichment -> elephant.se */
export function resolveCardPhotoUrl(
  elephant: ElephantRecord,
  enrichmentPhotoUrl?: string,
  communityPhotoUrl?: string
): string | undefined {
  const raw = communityPhotoUrl ?? enrichmentPhotoUrl ?? elephant.photos?.[0]?.url;
  return raw ? resolvePhotoUrl(raw) : undefined;
}

export async function enrichSearchResults(
  elephants: ElephantRecord[]
): Promise<ElephantRecord[]> {
  if (!elephants.length || !isMysqlConfigured()) return elephants;

  const ids = elephants.map((e) => e.id);
  const [summaries, community] = await Promise.all([
    getEnrichmentSummariesByElephantIdsMysql(ids),
    getCommunityPhotoSummaries(ids),
  ]);

  return elephants.map((elephant) => {
    const summary = summaries.get(elephant.id);
    const communityPhoto = community.get(elephant.id);
    const hasEnrichment = Boolean(summary) || Boolean(communityPhoto);
    const photoUrl = resolveCardPhotoUrl(
      elephant,
      summary?.photoUrl,
      communityPhoto?.url
    );
    if (!hasEnrichment && !photoUrl) return elephant;
    return { ...elephant, hasEnrichment, photoUrl };
  });
}

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

/** Community photos first, then enrichment, then elephant.se — deduped by resolved URL */
export function mergeProfilePhotos(
  elephantPhotos: ElephantPhoto[] | undefined,
  enrichment: ElephantEnrichment | null,
  communityPhotos?: CommunityPhoto[]
): ElephantPhoto[] {
  const seen = new Set<string>();
  const merged: ElephantPhoto[] = [];

  const add = (url: string, credit?: string) => {
    const resolved = url.startsWith("http") ? url : resolveElephantPhotoUrl(url);
    if (seen.has(resolved)) return;
    seen.add(resolved);
    merged.push({ url: resolved, credit });
  };

  for (const p of communityPhotos ?? []) {
    const credit = p.credit ?? (p.uploaderName ? `Photo by ${p.uploaderName}` : undefined);
    add(p.url, credit);
  }
  for (const p of enrichment?.photos ?? []) add(p.url, p.credit);
  for (const p of elephantPhotos ?? []) add(p.url, p.credit);

  return merged;
}
