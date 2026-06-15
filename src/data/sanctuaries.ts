import { sanctuaryList } from "./sanctuaryList";
import { extendedSanctuaries } from "./sanctuaryListExtended";
import { deriveExperienceTypes } from "./sanctuaryExperience";
import type { Sanctuary, SanctuaryRaw } from "./sanctuaryTypes";

function normalizeSanctuary(raw: SanctuaryRaw): Sanctuary {
  const externalConcerns = raw.externalConcerns ?? raw.redFlags ?? [];
  const { redFlags: _, ...rest } = raw;
  return {
    ...rest,
    experienceTypes: raw.experienceTypes ?? deriveExperienceTypes(raw.id, raw.welfare, raw.name),
    externalConcerns,
  };
}

export const sanctuaries: Sanctuary[] = [...sanctuaryList, ...extendedSanctuaries].map(normalizeSanctuary);

export type { Sanctuary, WelfareCriteria, OverallRating } from "./sanctuaryTypes";
export { experienceTypeLabels, experienceTypeVariants } from "./sanctuaryExperience";
