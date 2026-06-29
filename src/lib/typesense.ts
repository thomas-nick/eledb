import Typesense, { Client } from "typesense";
import type { CollectionCreateSchema } from "typesense/lib/Typesense/Collections";

export const ELEPHANTS_COLLECTION = "elephants";
export const LOCATIONS_COLLECTION = "locations";
export const MAHOOT_SYNONYM_SET = "mahoot";

export const elephantsCollectionSchema: CollectionCreateSchema = {
  name: ELEPHANTS_COLLECTION,
  synonym_sets: [MAHOOT_SYNONYM_SET],
  fields: [
    { name: "name", type: "string", sort: true },
    { name: "sex", type: "string", facet: true },
    { name: "status", type: "string", facet: true },
    { name: "subspecies", type: "string", facet: true },
    { name: "country", type: "string", facet: true },
    { name: "category", type: "string", facet: true },
    { name: "location_id", type: "string", optional: true },
    { name: "location_name", type: "string", facet: true },
    { name: "chip_id", type: "string", optional: true },
    { name: "father_name", type: "string", optional: true },
    { name: "mother_name", type: "string", optional: true },
    { name: "age_years", type: "int32", optional: true },
    { name: "birth_date", type: "string", optional: true },
    { name: "synced_at", type: "int64" },
    { name: "source_url", type: "string" },
    { name: "is_named", type: "bool", facet: true },
    { name: "has_enrichment", type: "bool", facet: true },
    { name: "has_photo", type: "bool", facet: true },
    { name: "popularity_score", type: "int32", sort: true },
  ],
  default_sorting_field: "synced_at",
};

export const locationsCollectionSchema: CollectionCreateSchema = {
  name: LOCATIONS_COLLECTION,
  synonym_sets: [MAHOOT_SYNONYM_SET],
  fields: [
    { name: "name", type: "string" },
    { name: "display_name", type: "string", optional: true },
    { name: "country", type: "string", facet: true },
    { name: "category", type: "string", facet: true },
    { name: "elephant_count", type: "int32" },
    { name: "living_count", type: "int32" },
    { name: "named_count", type: "int32" },
  ],
  default_sorting_field: "elephant_count",
};

let client: Client | null = null;

export function isTypesenseConfigured(): boolean {
  return Boolean(process.env.TYPESENSE_HOST && process.env.TYPESENSE_API_KEY);
}

export function getTypesenseClient(): Client {
  if (!isTypesenseConfigured()) {
    throw new Error("Typesense is not configured (TYPESENSE_HOST, TYPESENSE_API_KEY)");
  }

  if (!client) {
    client = new Typesense.Client({
      nodes: [
        {
          host: process.env.TYPESENSE_HOST!,
          port: Number(process.env.TYPESENSE_PORT ?? 443),
          protocol: process.env.TYPESENSE_PROTOCOL ?? "https",
        },
      ],
      apiKey: process.env.TYPESENSE_API_KEY!,
      connectionTimeoutSeconds: 10,
    });
  }

  return client;
}

/** Escape a Typesense filter value (backtick-quoted string). */
export function filterValue(value: string): string {
  return `\`${value.replace(/`/g, "\\`")}\``;
}
