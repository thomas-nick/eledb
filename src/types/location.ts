import type { ElephantCategory } from "./elephant";

export interface LocationProfile {
  description?: string;
  website?: string;
  contactEmail?: string;
  phone?: string;
  address?: string;
  welfareNotes?: string;
  heroPhotoUrl?: string;
  updatedAt?: string;
}

export interface LocationSummary {
  id: string;
  name: string;
  displayName: string;
  country: string;
  category: ElephantCategory;
  elephantCount: number;
  livingCount: number;
  namedCount: number;
  sanctuaryIds: string[];
  /** Owner/manager-supplied profile (present only when a camp has been claimed and edited). */
  profile?: LocationProfile;
  /** True when at least one verified manager exists for this camp. */
  claimed?: boolean;
}

export interface LocationListResult {
  locations: LocationSummary[];
  total: number;
  source: "mysql" | "local";
}
