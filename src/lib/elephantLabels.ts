import type {
  ElephantCategory,
  ElephantSex,
  ElephantStatus,
  ElephantSubspecies,
} from "@/types/elephant";

export const sexLabels: Record<ElephantSex, string> = {
  male: "Male",
  female: "Female",
  unknown: "Unknown",
};

export const statusLabels: Record<ElephantStatus, string> = {
  living: "Living",
  deceased: "Deceased",
};

export const categoryLabels: Record<ElephantCategory, string> = {
  camp: "Camp",
  zoo: "Zoo",
  temple: "Temple",
  wild: "Wild",
  hospital: "Hospital",
  other: "Other",
};

export const subspeciesLabels: Record<ElephantSubspecies, string> = {
  indian: "Indian",
  "sri-lankan": "Sri Lankan",
  sumatran: "Sumatran",
  borneo: "Bornean",
  unknown: "Unknown",
};

/** Human-friendly label for any facet value, falling back to title-case. */
export function facetLabel(
  dimension: "sex" | "status" | "category" | "subspecies",
  value: string
): string {
  switch (dimension) {
    case "sex":
      return sexLabels[value as ElephantSex] ?? titleCase(value);
    case "status":
      return statusLabels[value as ElephantStatus] ?? titleCase(value);
    case "category":
      return categoryLabels[value as ElephantCategory] ?? titleCase(value);
    case "subspecies":
      return subspeciesLabels[value as ElephantSubspecies] ?? titleCase(value);
    default:
      return titleCase(value);
  }
}

function titleCase(value: string): string {
  return value
    .split(/[\s-]+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}
