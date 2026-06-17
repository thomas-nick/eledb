import type { ElephantRecord } from "@/types/elephant";

/** elephant.se placeholder — no individual profile at source */
export function isUnnamedRecord(record: Pick<ElephantRecord, "name">): boolean {
  const n = record.name.trim().toLowerCase();
  return !n || n === "unknown" || n === "unnamed";
}

export function displayElephantName(record: Pick<ElephantRecord, "name" | "id">): string {
  if (isUnnamedRecord(record)) return `Unnamed elephant #${record.id}`;
  return record.name;
}
