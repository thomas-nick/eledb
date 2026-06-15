export interface DataSource {
  id: string;
  name: string;
  shortName: string;
  url: string;
  description: string;
  lastSynced: string;
}

export const dataSources: DataSource[] = [
  {
    id: "wap",
    name: "World Animal Protection",
    shortName: "WAP",
    url: "https://www.worldanimalprotection.org/our-campaigns/wildlife/commercial-exploitation/travel-tourism/elephant-friendly-tourist-guide/",
    description:
      "Elephant-Friendly Tourist Guide 2026 — one external welfare framework among several. Useful if hands-off tourism is your priority. Updated December 2025.",
    lastSynced: "2026-06-14",
  },
  {
    id: "aces",
    name: "Asian Captive Elephant Standards",
    shortName: "ACES",
    url: "https://www.elephantstandards.com/accredited-camps",
    description:
      "Independent accreditation using 190+ welfare criteria. Gold and Silver certifications for venues across Southeast Asia.",
    lastSynced: "2026-06-14",
  },
  {
    id: "ctc",
    name: "The Call to Conserve",
    shortName: "CTC",
    url: "https://www.thecalltoconserve.com/ethical-elephant-facilities",
    description:
      "Curated list of ethical elephant facilities in Asia, updated regularly by conservation researchers.",
    lastSynced: "2026-06-14",
  },
];

export type ExternalRatingType =
  | "wap-elephant-friendly"
  | "wap-high-welfare"
  | "wap-hand-feeding"
  | "aces-gold"
  | "aces-silver"
  | "ctc-recommended"
  | "wild-observation";

export interface ExternalRating {
  sourceId: string;
  type: ExternalRatingType;
  label: string;
  note?: string;
  verifiedDate?: string;
}

export const externalRatingLabels: Record<ExternalRatingType, string> = {
  "wap-elephant-friendly": "WAP Elephant Friendly",
  "wap-high-welfare": "WAP High Welfare",
  "wap-hand-feeding": "WAP Hand-Feeding Only",
  "aces-gold": "ACES Gold",
  "aces-silver": "ACES Silver",
  "ctc-recommended": "CTC Recommended",
  "wild-observation": "Wild Observation",
};

export const externalRatingVariants: Record<
  ExternalRatingType,
  "success" | "info" | "warning" | "default"
> = {
  "wap-elephant-friendly": "success",
  "wap-high-welfare": "info",
  "wap-hand-feeding": "warning",
  "aces-gold": "success",
  "aces-silver": "info",
  "ctc-recommended": "success",
  "wild-observation": "success",
};
