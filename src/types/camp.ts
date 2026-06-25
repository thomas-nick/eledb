export type CampClaimStatus = "pending" | "approved" | "rejected";

export interface CampProfile {
  locationId: string;
  description?: string;
  website?: string;
  contactEmail?: string;
  phone?: string;
  address?: string;
  welfareNotes?: string;
  heroPhotoUrl?: string;
  updatedBy?: string;
  updatedAt: string;
}

export const CAMP_PROFILE_FIELD_KEYS = [
  "description",
  "website",
  "contactEmail",
  "phone",
  "address",
  "welfareNotes",
  "heroPhotoUrl",
] as const;

export type CampProfileFieldKey = (typeof CAMP_PROFILE_FIELD_KEYS)[number];

export interface CampClaim {
  id: string;
  locationId: string;
  locationName: string;
  userId: string;
  roleAtCamp?: string;
  contact?: string;
  message?: string;
  status: CampClaimStatus;
  reviewerId?: string;
  reviewNote?: string;
  createdAt: string;
  reviewedAt?: string;
  userName?: string;
  userEmail?: string;
}

export interface ManagedLocation {
  locationId: string;
  createdAt: string;
}
