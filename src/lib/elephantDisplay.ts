import type { ElephantCategory, ElephantOrigin, ElephantSex, ElephantSubspecies } from "@/types/elephant";

export const sexLabel: Record<ElephantSex, string> = {
  male: "♂ Male",
  female: "♀ Female",
  unknown: "Sex unknown",
};

export const sexShort: Record<ElephantSex, string> = {
  male: "♂",
  female: "♀",
  unknown: "?",
};

export const subspeciesLabel: Record<ElephantSubspecies, string> = {
  indian: "Indian elephant",
  "sri-lankan": "Sri Lankan elephant",
  sumatran: "Sumatran elephant",
  borneo: "Bornean elephant",
  unknown: "Asian elephant",
};

export const subspeciesScientific: Record<ElephantSubspecies, string> = {
  indian: "Elephas maximus indicus",
  "sri-lankan": "Elephas maximus maximus",
  sumatran: "Elephas maximus sumatrensis",
  borneo: "Elephas maximus borneensis",
  unknown: "Elephas maximus",
};

export const originLabel: Record<ElephantOrigin, string> = {
  "wild-caught": "Wild-caught",
  "captive-born": "Captive-born",
  unknown: "Unknown origin",
};

export const categoryLabel: Record<ElephantCategory, string> = {
  camp: "Camp",
  zoo: "Zoo",
  temple: "Temple",
  wild: "Wild",
  hospital: "Hospital",
  other: "Other",
};
