export type ElephantSex = "male" | "female" | "unknown";
export type ElephantStatus = "living" | "deceased";
export type ElephantCategory = "camp" | "zoo" | "temple" | "wild" | "hospital" | "other";
export type ElephantSubspecies = "indian" | "sri-lankan" | "sumatran" | "borneo" | "unknown";
export type ElephantOrigin = "wild-caught" | "captive-born" | "unknown";
export type ElephantSort = "name" | "age" | "updated";

export interface ElephantTransfer {
  date?: string;
  toLocation?: string;
  toLocationId?: string;
  fromLocation?: string;
  fromLocationId?: string;
}

export interface ElephantPhoto {
  url: string;
  credit?: string;
}

export interface ElephantRecord {
  id: string;
  name: string;
  sex: ElephantSex;
  status: ElephantStatus;
  species: "asian";
  subspecies?: ElephantSubspecies;
  birthDate?: string;
  birthPlace?: string;
  deathDate?: string;
  deathReason?: string;
  ageYears?: number;
  origin?: ElephantOrigin;
  locationId?: string;
  locationName: string;
  country: string;
  category: ElephantCategory;
  chipId?: string;
  localId?: string;
  regionalIds?: Record<string, string>;
  fatherName?: string;
  motherName?: string;
  fatherId?: string;
  motherId?: string;
  arrivalDate?: string;
  management?: string;
  transfers?: ElephantTransfer[];
  photos?: ElephantPhoto[];
  sources?: string[];
  sourceUrl: string;
  syncedAt: string;
}

export interface ElephantSearchParams {
  q?: string;
  country?: string;
  status?: ElephantStatus;
  sex?: ElephantSex;
  subspecies?: ElephantSubspecies;
  locationId?: string;
  locationName?: string;
  category?: ElephantCategory;
  sort?: ElephantSort;
  /** When true, hide elephant.se placeholders with no real name */
  namedOnly?: boolean;
  page?: number;
  perPage?: number;
}

export interface ElephantSearchResult {
  elephants: ElephantRecord[];
  total: number;
  page: number;
  perPage: number;
  facets: {
    countries: { value: string; count: number }[];
    statuses: { value: string; count: number }[];
    categories: { value: string; count: number }[];
    subspecies: { value: string; count: number }[];
    locations: { value: string; count: number }[];
  };
  source: "mysql" | "local";
}
