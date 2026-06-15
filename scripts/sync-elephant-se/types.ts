import type {
  ElephantCategory,
  ElephantOrigin,
  ElephantPhoto,
  ElephantSex,
  ElephantStatus,
  ElephantSubspecies,
  ElephantTransfer,
} from "../../src/types/elephant";

export type { ElephantCategory, ElephantOrigin, ElephantPhoto, ElephantSex, ElephantStatus, ElephantSubspecies, ElephantTransfer };

export interface SyncElephantRecord {
  id: string;
  name: string;
  sex: ElephantSex;
  status: ElephantStatus;
  species: "asian";
  subspecies?: ElephantSubspecies;
  birthDate?: string;
  birthPlace?: string;
  deathDate?: string;
  deathReason?: string;
  ageYears?: number;
  origin?: ElephantOrigin;
  locationId?: string;
  locationName: string;
  country: string;
  category: ElephantCategory;
  chipId?: string;
  localId?: string;
  regionalIds?: Record<string, string>;
  fatherName?: string;
  motherName?: string;
  fatherId?: string;
  motherId?: string;
  arrivalDate?: string;
  management?: string;
  transfers?: ElephantTransfer[];
  photos?: ElephantPhoto[];
  sources?: string[];
  sourceUrl: string;
  syncedAt: string;
}

export const ELEPHANT_SE_BASE = "https://www.elephant.se";
export const RSS_URL = `${ELEPHANT_SE_BASE}/sitemap.xml`;
export const THAILAND_SEARCH_URL = `${ELEPHANT_SE_BASE}/search.php?lang=en&q=${encodeURIComponent("Thailand")}`;
export const THAILAND_COUNTRY = "Thailand";
export const DEFAULT_MAX_ELEPHANT_ID = 18500;

export function elephantPageUrl(id: string | number) {
  return `${ELEPHANT_SE_BASE}/database2.php?elephant_id=${id}`;
}

export function locationPageUrl(id: string | number) {
  return `${ELEPHANT_SE_BASE}/location2.php?location_id=${id}`;
}

export function countryPageUrl(country: string) {
  return `${ELEPHANT_SE_BASE}/country.php?name=${encodeURIComponent(country)}`;
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function normalizeCategory(raw?: string): ElephantCategory {
  const value = (raw ?? "").toLowerCase();
  if (value.includes("zoo")) return "zoo";
  if (value.includes("temple")) return "temple";
  if (value.includes("wild")) return "wild";
  if (value.includes("hospital")) return "hospital";
  if (value.includes("camp")) return "camp";
  return "other";
}

export function parseSexFromText(text: string): ElephantSex {
  if (text.includes("♂") || /\bmale\b/i.test(text)) return "male";
  if (text.includes("♀") || /\bfemale\b/i.test(text)) return "female";
  return "unknown";
}

export function parseAgeYears(text: string): number | undefined {
  const match = text.match(/(\d+)\s*years?\s*old/i);
  return match ? Number(match[1]) : undefined;
}

export function cleanDate(value?: string): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed || trimmed === "0000-00-00") return undefined;
  return trimmed.replace(/^~/, "");
}
