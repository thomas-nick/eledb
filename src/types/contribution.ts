export type ContributionType = "info" | "photo";
export type ContributionStatus = "pending" | "approved" | "rejected";

export const OVERRIDE_FIELD_KEYS = [
  "name",
  "sex",
  "status",
  "subspecies",
  "birthDate",
  "birthPlace",
  "ageYears",
  "origin",
  "country",
  "fatherName",
  "motherName",
  "management",
] as const;

export type OverrideFieldKey = (typeof OVERRIDE_FIELD_KEYS)[number];

export interface PhotoContributionPayload {
  filePath: string;
  publicUrl: string;
  credit?: string;
  caption?: string;
}

export interface InfoContributionPayload {
  changes: Partial<Record<OverrideFieldKey, string | number>>;
}

export interface ContributionRecord {
  id: string;
  elephantId: string;
  userId: string;
  type: ContributionType;
  payload: PhotoContributionPayload | InfoContributionPayload;
  status: ContributionStatus;
  reviewerId?: string;
  reviewNote?: string;
  createdAt: string;
  reviewedAt?: string;
  userName?: string;
  userEmail?: string;
}

export interface CommunityPhoto {
  id: string;
  elephantId: string;
  contributionId?: string;
  url: string;
  credit?: string;
  caption?: string;
  uploadedBy?: string;
  uploaderName?: string;
  createdAt: string;
}

export interface ElephantOverride {
  elephantId: string;
  fields: Partial<Record<OverrideFieldKey, string | number>>;
  updatedBy?: string;
  updatedAt: string;
}
