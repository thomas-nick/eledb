/**
 * Fetches geo-countries GeoJSON and writes real SVG paths to src/data/mapGeometry.ts.
 * Run: npx tsx scripts/generate-map-paths.ts
 */

import { writeFileSync } from "fs";
import { join } from "path";

const GEOJSON_URL =
  "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson";

const ISO3_TO_KEY: Record<string, string> = {
  IND: "india",
  NPL: "nepal",
  BTN: "bhutan",
  BGD: "bangladesh",
  LKA: "sriLanka",
  MMR: "myanmar",
  THA: "thailand",
  LAO: "laos",
  KHM: "cambodia",
  VNM: "vietnam",
  MYS: "malaysia",
  IDN: "indonesia",
  CHN: "china",
};

const VIEWBOX = { width: 800, height: 520, padding: 16 };
const BOUNDS = { minLng: 60, maxLng: 138, minLat: -12, maxLat: 36 };

function project(lng: number, lat: number): [number, number] {
  const { width, height, padding } = VIEWBOX;
  const { minLng, maxLng, minLat, maxLat } = BOUNDS;
  const x = padding + ((lng - minLng) / (maxLng - minLng)) * (width - 2 * padding);
  const y = padding + ((maxLat - lat) / (maxLat - minLat)) * (height - 2 * padding);
  return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
}

function distSq(a: [number, number], b: [number, number]): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return dx * dx + dy * dy;
}

function perpDist(
  p: [number, number],
  a: [number, number],
  b: [number, number]
): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  if (dx === 0 && dy === 0) return Math.sqrt(distSq(p, a));
  const t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy);
  const proj: [number, number] = [
    a[0] + t * dx,
    a[1] + t * dy,
  ];
  return Math.sqrt(distSq(p, proj));
}

function simplifyRing(ring: [number, number][], tolerance: number): [number, number][] {
  if (ring.length <= 4) return ring;
  let maxDist = 0;
  let idx = 0;
  const end = ring.length - 1;
  for (let i = 1; i < end; i++) {
    const d = perpDist(ring[i], ring[0], ring[end]);
    if (d > maxDist) {
      maxDist = d;
      idx = i;
    }
  }
  if (maxDist > tolerance) {
    const left = simplifyRing(ring.slice(0, idx + 1), tolerance);
    const right = simplifyRing(ring.slice(idx), tolerance);
    return [...left.slice(0, -1), ...right];
  }
  return [ring[0], ring[end]];
}

function ringBBox(ring: [number, number][]): { w: number; h: number } {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const [x, y] of ring) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
  return { w: maxX - minX, h: maxY - minY };
}

function ringToPath(coords: number[][], tolerance: number): string {
  const projected = coords.map(([lng, lat]) => project(lng, lat));
  const simplified = simplifyRing(projected, tolerance);
  if (simplified.length < 3) return "";
  const { w, h } = ringBBox(simplified);
  if (w < 5 && h < 5) return "";
  const [x0, y0] = simplified[0];
  let d = `M ${x0} ${y0}`;
  for (let i = 1; i < simplified.length; i++) {
    d += ` L ${simplified[i][0]} ${simplified[i][1]}`;
  }
  return d + " Z";
}

function cleanPath(d: string): string {
  return d
    .split(/\s+Z\s+/)
    .map((part) => (part.startsWith("M") ? part : `M ${part}`))
    .filter((part) => {
      const nums = part.match(/-?\d+\.?\d*/g)?.map(Number) ?? [];
      if (nums.length < 6) return false;
      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;
      for (let i = 0; i < nums.length; i += 2) {
        minX = Math.min(minX, nums[i]);
        maxX = Math.max(maxX, nums[i]);
        minY = Math.min(minY, nums[i + 1]);
        maxY = Math.max(maxY, nums[i + 1]);
      }
      return maxX - minX >= 5 || maxY - minY >= 5;
    })
    .map((part) => `${part} Z`)
    .join(" ");
}

function geometryToPath(
  geometry: GeoJSON.Geometry,
  tolerance: number
): string {
  const parts: string[] = [];
  if (geometry.type === "Polygon") {
    for (const ring of geometry.coordinates) {
      const p = ringToPath(ring, tolerance);
      if (p) parts.push(p);
    }
  } else if (geometry.type === "MultiPolygon") {
    for (const poly of geometry.coordinates) {
      for (const ring of poly) {
        const p = ringToPath(ring, tolerance);
        if (p) parts.push(p);
      }
    }
  }
  return cleanPath(parts.join(" "));
}

function ringCentroid(coords: number[][]): [number, number] {
  let sx = 0;
  let sy = 0;
  let n = 0;
  for (const [lng, lat] of coords) {
    const [x, y] = project(lng, lat);
    sx += x;
    sy += y;
    n++;
  }
  return [Math.round(sx / n), Math.round(sy / n)];
}

function geometryCentroid(geometry: GeoJSON.Geometry): [number, number] {
  if (geometry.type === "Polygon") {
    return ringCentroid(geometry.coordinates[0]);
  }
  if (geometry.type === "MultiPolygon") {
    let largest = geometry.coordinates[0][0];
    let maxLen = largest.length;
    for (const poly of geometry.coordinates) {
      if (poly[0].length > maxLen) {
        maxLen = poly[0].length;
        largest = poly[0];
      }
    }
    return ringCentroid(largest);
  }
  return [400, 260];
}

type FeatureCollection = {
  features: Array<{
    properties?: Record<string, string>;
    geometry: GeoJSON.Geometry;
  }>;
};

async function main() {
  const res = await fetch(GEOJSON_URL);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const geo = (await res.json()) as FeatureCollection;

  const paths: Record<string, string> = {};
  const labels: Record<string, { x: number; y: number; anchor: string }> = {};

  for (const feature of geo.features) {
    const iso =
      feature.properties?.["ISO3166-1-Alpha-3"] ??
      feature.properties?.["ISO_A3"];
    if (!iso) continue;
    const key = ISO3_TO_KEY[iso.toUpperCase()];
    if (!key) continue;

    const tolerance =
      key === "indonesia" || key === "india" ? 3.5 : key === "china" ? 4 : 2;
    paths[key] = geometryToPath(feature.geometry, tolerance);
    const [x, y] = geometryCentroid(feature.geometry);
    const labelKey = key === "sriLanka" ? "sri-lanka" : key;
    labels[labelKey] = { x, y, anchor: "middle" };
  }

  const orderedKeys = Object.values(ISO3_TO_KEY);
  for (const k of orderedKeys) {
    if (!paths[k]) console.warn(`Missing path for ${k}`);
  }

  const mapPathsLines = orderedKeys
    .filter((k) => paths[k])
    .map((k) => `  ${k}:\n    "${paths[k]}",`)
    .join("\n");

  const labelLines = Object.entries(labels)
    .map(([k, v]) => `  ${k.includes("-") ? `"${k}"` : k}: { x: ${v.x}, y: ${v.y}, anchor: "${v.anchor}" },`)
    .join("\n");

  const out = `export const MAP_VIEWBOX = "0 0 ${VIEWBOX.width} ${VIEWBOX.height}";

/** Real country outlines (geo-countries / Natural Earth), projected to Asian elephant range */
export const mapPaths = {
${mapPathsLines}
} as const;

export const mapLabels: Record<string, { x: number; y: number; anchor?: "start" | "middle" | "end" }> = {
${labelLines}
};

export const regionLabels = [
  { text: "South Asia", x: 175, y: 95 },
  { text: "Southeast Asia", x: 400, y: 95 },
  { text: "Indian Ocean", x: 120, y: 400 },
  { text: "Bay of Bengal", x: 280, y: 280 },
];
`;

  const dest = join(process.cwd(), "src/data/mapGeometry.ts");
  writeFileSync(dest, out, "utf8");
  console.log(`Wrote ${dest} (${orderedKeys.filter((k) => paths[k]).length} countries)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
