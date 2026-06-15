import { WelfareCriteria } from "./sanctuaries";

export type ExperienceType =
  | "hands-on"
  | "observation-only"
  | "wild-safari"
  | "family-run"
  | "volunteer"
  | "rescue-retirement"
  | "mahout-culture";

export const experienceTypeLabels: Record<ExperienceType, string> = {
  "hands-on": "Hands-On",
  "observation-only": "Observe Only",
  "wild-safari": "Wild Safari",
  "family-run": "Family-Run",
  volunteer: "Volunteer",
  "rescue-retirement": "Rescue & Retirement",
  "mahout-culture": "Mahout Culture",
};

export const experienceTypeVariants: Record<
  ExperienceType,
  "default" | "success" | "info" | "warning"
> = {
  "hands-on": "warning",
  "observation-only": "success",
  "wild-safari": "info",
  "family-run": "default",
  volunteer: "info",
  "rescue-retirement": "success",
  "mahout-culture": "default",
};

const experienceOverrides: Record<string, ExperienceType[]> = {
  "patara-elephant": ["hands-on", "family-run", "mahout-culture", "rescue-retirement"],
  "pinnawala-orphanage": ["hands-on", "family-run"],
  "minneriya-safari": ["wild-safari"],
  "kaziranga-wildlife": ["wild-safari"],
  "mef-life": ["observation-only", "volunteer"],
  "mef-palatha": ["observation-only", "volunteer"],
  "wildlife-sos-india": ["rescue-retirement", "volunteer"],
  "elephant-nature-park": ["rescue-retirement", "volunteer", "hands-on"],
  "laos-elephant-conservation-centre": ["rescue-retirement", "observation-only"],
};

export function deriveExperienceTypes(
  id: string,
  welfare: WelfareCriteria,
  name: string
): ExperienceType[] {
  if (experienceOverrides[id]) return experienceOverrides[id];

  const types: ExperienceType[] = [];

  if (name.toLowerCase().includes("safari") || id.includes("minneriya") || id.includes("kaziranga")) {
    types.push("wild-safari");
  }
  if (welfare.handsOffObservation && welfare.noRiding) {
    types.push("observation-only");
  } else if (!welfare.handsOffObservation) {
    types.push("hands-on");
  }
  if (id.includes("mef") || id.includes("volunteer") || name.toLowerCase().includes("volunteer")) {
    types.push("volunteer");
  }
  if (name.toLowerCase().includes("rescue") || name.toLowerCase().includes("nature park") || name.toLowerCase().includes("haven")) {
    types.push("rescue-retirement");
  }
  if (name.toLowerCase().includes("family") || name.toLowerCase().includes("park & lodge")) {
    types.push("family-run");
  }

  if (types.length === 0) types.push("hands-on");
  return [...new Set(types)];
}
