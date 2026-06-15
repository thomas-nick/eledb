import { ExternalRating } from "./sanctuarySources";
import { ExperienceType } from "./sanctuaryExperience";

export interface WelfareCriteria {
  noRiding: boolean;
  noChaining: boolean;
  naturalForaging: boolean;
  handsOffObservation: boolean;
  veterinaryCare: boolean;
  spaciousEnclosure: boolean;
}

export type OverallRating = "excellent" | "good" | "caution" | "avoid";

export interface SanctuaryRaw {
  id: string;
  name: string;
  country: string;
  region: string;
  description: string;
  welfare: WelfareCriteria;
  experienceTypes?: ExperienceType[];
  overallRating?: OverallRating;
  visitorCapacity: "low" | "medium" | "high";
  priceRange: "$" | "$$" | "$$$";
  website?: string;
  externalRatings?: ExternalRating[];
  highlights: string[];
  contextNotes?: string[];
  externalConcerns?: string[];
  redFlags?: string[];
  /** Override search term on elephant.se when facility name differs */
  elephantSeQuery?: string;
}

export interface Sanctuary extends Omit<SanctuaryRaw, "redFlags"> {
  experienceTypes: ExperienceType[];
  externalConcerns: string[];
}
