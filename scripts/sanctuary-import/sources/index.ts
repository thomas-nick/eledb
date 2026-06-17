import { enpSource } from "./enp";
import { phuketSource } from "./phuket";
import { wildlifeSosSource } from "./wildlife-sos";
import type { SanctuaryImportSource } from "../types";

export const sanctuarySources: SanctuaryImportSource[] = [
  enpSource,
  wildlifeSosSource,
  phuketSource,
];

export const sanctuarySourceMap = Object.fromEntries(
  sanctuarySources.map((s) => [s.id, s])
) as Record<string, SanctuaryImportSource>;
