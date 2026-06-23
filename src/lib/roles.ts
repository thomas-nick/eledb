import type { UserRole } from "@/types/auth";

export function isModerator(role: UserRole): boolean {
  return role === "moderator" || role === "admin";
}
