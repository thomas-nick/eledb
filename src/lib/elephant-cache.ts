import { cache } from "react";
import { getElephantById, getHerdMates, getOffspring } from "@/lib/elephants";
import { getElephantEnrichment } from "@/lib/elephantEnrichments";
import { getCommunityPhotos } from "@/lib/contribution-db";

export const getCachedElephantById = cache(getElephantById);
export const getCachedOffspring = cache(getOffspring);
export const getCachedHerdMates = cache(getHerdMates);
export const getCachedElephantEnrichment = cache(getElephantEnrichment);
export const getCachedCommunityPhotos = cache(getCommunityPhotos);

/** Lightweight name lookup for parent links. */
export const getCachedElephantNameById = cache(async (id: string) => {
  const record = await getElephantById(id);
  return record ? { id: record.id, name: record.name } : null;
});
