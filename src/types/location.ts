import type { ElephantCategory } from "./elephant";

export interface LocationSummary {
  id: string;
  name: string;
  displayName: string;
  country: string;
  category: ElephantCategory;
  elephantCount: number;
  livingCount: number;
  sanctuaryIds: string[];
}

export interface LocationListResult {
  locations: LocationSummary[];
  total: number;
  source: "mysql" | "local";
}
