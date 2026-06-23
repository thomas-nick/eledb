import type { RangeState } from "@/data/rangeStates";
import { trendColors } from "@/data/rangeStates";

/** ISO 3166-1 alpha-3 → rangeStates.id */
export const iso3ToRangeId: Record<string, string> = {
  IND: "india",
  NPL: "nepal",
  BTN: "bhutan",
  BGD: "bangladesh",
  LKA: "sri-lanka",
  MMR: "myanmar",
  THA: "thailand",
  LAO: "laos",
  KHM: "cambodia",
  VNM: "vietnam",
  MYS: "malaysia",
  IDN: "indonesia",
  CHN: "china",
};

export const rangeIdToIso3 = Object.fromEntries(
  Object.entries(iso3ToRangeId).map(([iso, id]) => [id, iso])
) as Record<string, string>;

export const GEOJSON_URL =
  "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson";

export const RANGE_ISO3 = new Set(Object.keys(iso3ToRangeId));

export const MAP_CENTER: [number, number] = [15, 95];
export const MAP_ZOOM = 4;

export function trendFill(trend: RangeState["populationTrend"], active = false): string {
  const colors = trendColors[trend];
  return active ? colors.hover : colors.fill;
}

export function featureToRangeId(feature: GeoJSON.Feature): string | null {
  const iso =
    feature.properties?.["ISO_A3"] ??
    feature.properties?.["ISO_A3_EH"] ??
    feature.properties?.["iso_a3"];
  if (!iso || typeof iso !== "string") return null;
  return iso3ToRangeId[iso.toUpperCase()] ?? null;
}
