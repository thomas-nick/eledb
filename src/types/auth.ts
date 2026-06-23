export type UserRole = "user" | "moderator" | "admin";

export interface UserRecord {
  id: string;
  email: string;
  passwordHash?: string;
  name?: string;
  image?: string;
  provider: "credentials" | "google";
  role: UserRole;
  createdAt: string;
}
