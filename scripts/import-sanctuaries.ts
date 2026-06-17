#!/usr/bin/env npx tsx
/**
 * Import sanctuary elephant profiles into elephant_enrichments.
 *
 * Usage:
 *   npm run import:sanctuaries              # all sources
 *   npm run import:sanctuaries -- enp       # shorthand ids
 *   npm run import:sanctuaries -- wildlife-sos phuket
 *
 * Source ids: elephant-nature-park, wildlife-sos, phuket-elephant-sanctuary
 * Shorthands: enp, wss, wsos, phuket
 */
import { runSanctuaryImport } from "./sanctuary-import/run";
import { sanctuarySourceMap } from "./sanctuary-import/sources";

const SHORTHAND: Record<string, string> = {
  enp: "elephant-nature-park",
  wss: "wildlife-sos",
  wsos: "wildlife-sos",
  phuket: "phuket-elephant-sanctuary",
  pes: "phuket-elephant-sanctuary",
};

const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const sourceIds = args.map((a) => SHORTHAND[a] ?? a);

for (const id of sourceIds) {
  if (!sanctuarySourceMap[id]) {
    console.error(`Unknown source: ${id}`);
    console.error("Available:", Object.keys(sanctuarySourceMap).join(", "));
    process.exit(1);
  }
}

runSanctuaryImport(sourceIds.length ? sourceIds : undefined).catch((err) => {
  console.error(err);
  process.exit(1);
});
