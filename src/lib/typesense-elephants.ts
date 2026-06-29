import {
  ELEPHANTS_COLLECTION,
  filterValue,
  getTypesenseClient,
} from "@/lib/typesense";
import type {
  ElephantRecord,
  ElephantSearchParams,
  ElephantSearchResult,
  ElephantSort,
} from "@/types/elephant";

export interface TypesenseElephantDoc {
  id: string;
  name: string;
  sex: string;
  status: string;
  subspecies: string;
  country: string;
  category: string;
  location_id?: string;
  location_name: string;
  chip_id?: string;
  father_name?: string;
  mother_name?: string;
  age_years?: number;
  birth_date?: string;
  synced_at: number;
  source_url: string;
  is_named: boolean;
  has_enrichment: boolean;
  has_photo: boolean;
  popularity_score: number;
}

function docToRecord(doc: TypesenseElephantDoc): ElephantRecord {
  return {
    id: doc.id,
    name: doc.name,
    sex: doc.sex as ElephantRecord["sex"],
    status: doc.status as ElephantRecord["status"],
    species: "asian",
    subspecies: doc.subspecies as ElephantRecord["subspecies"],
    birthDate: doc.birth_date || undefined,
    ageYears: doc.age_years,
    locationId: doc.location_id,
    locationName: doc.location_name,
    country: doc.country,
    category: doc.category as ElephantRecord["category"],
    chipId: doc.chip_id,
    fatherName: doc.father_name,
    motherName: doc.mother_name,
    sourceUrl: doc.source_url,
    syncedAt: new Date(doc.synced_at).toISOString(),
    hasEnrichment: doc.has_enrichment,
  };
}

function buildFilterBy(params: ElephantSearchParams): string | undefined {
  const parts: string[] = [];

  if (params.country) parts.push(`country:=${filterValue(params.country)}`);
  if (params.status) parts.push(`status:=${filterValue(params.status)}`);
  if (params.sex) parts.push(`sex:=${filterValue(params.sex)}`);
  if (params.subspecies) parts.push(`subspecies:=${filterValue(params.subspecies)}`);
  if (params.category) parts.push(`category:=${filterValue(params.category)}`);
  if (params.locationId) parts.push(`location_id:=${filterValue(params.locationId)}`);
  else if (params.locationName) parts.push(`location_name:=${filterValue(params.locationName)}`);
  if (params.namedOnly) parts.push("is_named:=true");
  if (params.hasStory) parts.push("has_enrichment:=true");

  return parts.length ? parts.join(" && ") : undefined;
}

function buildSortBy(sort?: ElephantSort, q?: string): string {
  const hasQuery = q && q.trim() && q.trim() !== "*";
  if (hasQuery) {
    return "_text_match:desc,popularity_score:desc,name:asc";
  }
  switch (sort) {
    case "age":
      return "age_years:desc,name:asc";
    case "updated":
      return "synced_at:desc,name:asc";
    default:
      return "name:asc";
  }
}

function mapFacets(
  facetCounts: { field_name: string; counts: { value: string; count: number }[] }[] | undefined
): ElephantSearchResult["facets"] {
  const byField = new Map(
    (facetCounts ?? []).map((f) => [f.field_name, f.counts.map((c) => ({ value: c.value, count: c.count }))])
  );

  return {
    countries: byField.get("country") ?? [],
    statuses: byField.get("status") ?? [],
    categories: byField.get("category") ?? [],
    subspecies: byField.get("subspecies") ?? [],
    locations: byField.get("location_name") ?? [],
    sexes: byField.get("sex") ?? [],
  };
}

export async function searchElephantsTypesense(
  params: ElephantSearchParams
): Promise<ElephantSearchResult> {
  const client = getTypesenseClient();
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 24;
  const q = params.q?.trim() || "*";

  const result = await client
    .collections(ELEPHANTS_COLLECTION)
    .documents()
    .search({
      q,
      query_by: "name,location_name,country,father_name,mother_name,chip_id",
      query_by_weights: "8,5,2,1,1,4",
      filter_by: buildFilterBy(params),
      facet_by: "country,status,sex,category,subspecies,location_name",
      max_facet_values: 30,
      page,
      per_page: perPage,
      sort_by: buildSortBy(params.sort, q),
    });

  const elephants = (result.hits ?? []).map((hit: { document: unknown }) =>
    docToRecord(hit.document as TypesenseElephantDoc)
  );

  return {
    elephants,
    total: result.found ?? 0,
    page,
    perPage,
    facets: mapFacets(result.facet_counts),
    source: "typesense",
  };
}

import { computePopularityScore } from "@/lib/typesense-queries";

export function recordToTypesenseDoc(
  record: ElephantRecord,
  options: { isNamed: boolean; hasEnrichment: boolean; hasPhoto: boolean }
): TypesenseElephantDoc {
  return {
    id: record.id,
    name: record.name,
    sex: record.sex,
    status: record.status,
    subspecies: record.subspecies ?? "unknown",
    country: record.country,
    category: record.category,
    location_id: record.locationId,
    location_name: record.locationName,
    chip_id: record.chipId,
    father_name: record.fatherName,
    mother_name: record.motherName,
    age_years: record.ageYears,
    birth_date: record.birthDate,
    synced_at: new Date(record.syncedAt).getTime(),
    source_url: record.sourceUrl,
    is_named: options.isNamed,
    has_enrichment: options.hasEnrichment,
    has_photo: options.hasPhoto,
    popularity_score: computePopularityScore({
      isNamed: options.isNamed,
      status: record.status,
      hasEnrichment: options.hasEnrichment,
      hasPhoto: options.hasPhoto,
    }),
  };
}
