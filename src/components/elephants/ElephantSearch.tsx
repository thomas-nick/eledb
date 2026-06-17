"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ElephantCard } from "@/components/elephants/ElephantCard";
import { ElephantAttribution } from "@/components/elephants/ElephantAttribution";
import { Container } from "@/components/ui/Container";
import type {
  ElephantCategory,
  ElephantSearchResult,
  ElephantSex,
  ElephantSort,
  ElephantStatus,
  ElephantSubspecies,
} from "@/types/elephant";
import type { LocationSummary } from "@/types/location";
import { cn } from "@/lib/utils";

const statusOptions: { value: ElephantStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "living", label: "Living" },
  { value: "deceased", label: "Deceased" },
];

const sexOptions: { value: ElephantSex | "all"; label: string }[] = [
  { value: "all", label: "All sexes" },
  { value: "female", label: "♀ Female" },
  { value: "male", label: "♂ Male" },
];

const sortOptions: { value: ElephantSort; label: string }[] = [
  { value: "name", label: "Name A–Z" },
  { value: "age", label: "Age" },
  { value: "updated", label: "Recently updated" },
];

const rangeCountries = [
  "Thailand",
  "India",
  "Sri Lanka",
  "Myanmar",
  "Nepal",
  "Cambodia",
  "Laos",
  "Indonesia",
  "Vietnam",
];

export function ElephantSearch() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [result, setResult] = useState<ElephantSearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [campChips, setCampChips] = useState<LocationSummary[]>([]);

  const country = searchParams.get("country") ?? "";
  const status = (searchParams.get("status") as ElephantStatus | null) ?? "";
  const sex = (searchParams.get("sex") as ElephantSex | null) ?? "";
  const subspecies = (searchParams.get("subspecies") as ElephantSubspecies | null) ?? "";
  const category = (searchParams.get("category") as ElephantCategory | null) ?? "";
  const sort = (searchParams.get("sort") as ElephantSort | null) ?? "name";
  const page = Number(searchParams.get("page") ?? 1);
  const locationId = searchParams.get("locationId") ?? "";
  const locationName =
    searchParams.get("locationName") ?? searchParams.get("location") ?? "";
  const includeUnnamed = searchParams.get("includeUnnamed") === "true";

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (!value) params.delete(key);
        else params.set(key, value);
      }
      if (!("page" in updates)) params.delete("page");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    const q = searchParams.get("q");
    if (q) params.set("q", q);
    if (country) params.set("country", country);
    if (status) params.set("status", status);
    if (sex) params.set("sex", sex);
    if (subspecies) params.set("subspecies", subspecies);
    if (category) params.set("category", category);
    if (sort) params.set("sort", sort);
    if (locationId) params.set("locationId", locationId);
    if (locationName) params.set("locationName", locationName);
    if (includeUnnamed) params.set("includeUnnamed", "true");
    params.set("page", String(page));

    setLoading(true);
    fetch(`/api/elephants/search?${params}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data: ElephantSearchResult) => setResult(data))
      .catch(() => {})
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [searchParams, country, status, sex, subspecies, category, sort, page, locationId, locationName, includeUnnamed]);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    params.set("category", "camp");
    params.set("limit", "12");
    if (country) params.set("country", country);
    else params.set("country", "Thailand");

    fetch(`/api/locations?${params}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data: { locations: LocationSummary[] }) => setCampChips(data.locations ?? []))
      .catch(() => setCampChips([]));

    return () => controller.abort();
  }, [country]);

  useEffect(() => {
    const q = query.trim();
    const urlQ = searchParams.get("q") ?? "";
    if (q === urlQ) return;

    const timer = setTimeout(() => {
      updateParams({ q: q || null });
    }, 300);
    return () => clearTimeout(timer);
  }, [query, searchParams, updateParams]);

  const countries = result?.facets.countries ?? [];
  const categories = result?.facets.categories ?? [];
  const subspeciesList = result?.facets.subspecies ?? [];
  const totalPages = result ? Math.ceil(result.total / result.perPage) : 0;

  return (
    <>
      <section className="py-16 md:py-24 bg-forest text-ivory">
        <Container>
          <p className="text-sm font-semibold uppercase tracking-widest text-clay mb-3">
            Asian Elephant Database
          </p>
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-ivory leading-tight">
            Every Named Asian Elephant, Searchable
          </h1>
          <p className="mt-4 text-lg text-ivory/80 max-w-2xl leading-relaxed">
            Individual records from elephant.se — births, transfers, parentage, chip IDs, and camp history across 13 range countries and zoos worldwide.
          </p>
        </Container>
      </section>

      <section className="py-10 border-b border-border bg-sage/10">
        <Container size="wide">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, camp, country, chip ID, parent..."
              className="flex-1 px-4 py-3 rounded-xl border border-border bg-card text-forest placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-forest/20"
            />
            <select
              value={sort}
              onChange={(e) => updateParams({ sort: e.target.value })}
              className="px-4 py-3 rounded-xl border border-border bg-card text-forest text-sm"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {(locationName || locationId) && (
            <div className="mb-4 flex items-center gap-2 text-sm flex-wrap">
              <span className="text-muted">Filtered to facility:</span>
              {locationId ? (
                <a
                  href={`/camps/${locationId}`}
                  className="font-medium text-forest hover:text-clay"
                >
                  {locationName || `Location #${locationId}`}
                </a>
              ) : (
                <span className="font-medium text-forest">{locationName}</span>
              )}
              <button
                type="button"
                onClick={() => updateParams({ locationId: null, locationName: null })}
                className="text-clay hover:text-forest ml-2"
              >
                Clear
              </button>
            </div>
          )}

          {campChips.length > 0 && !locationId && (
            <FilterRow label={country ? `Top camps in ${country}` : "Top camps in Thailand"}>
              {campChips.map((loc) => (
                <FilterChip
                  key={loc.id}
                  active={locationId === loc.id}
                  onClick={() =>
                    updateParams({
                      locationId: loc.id,
                      locationName: loc.name,
                      category: "camp",
                    })
                  }
                >
                  {loc.displayName}{" "}
                  <span className="opacity-60">{loc.livingCount}</span>
                  {loc.sanctuaryIds.length > 0 && (
                    <span className="ml-0.5 text-[10px] opacity-80">★</span>
                  )}
                </FilterChip>
              ))}
              <a
                href={`/camps?country=${encodeURIComponent(country || "Thailand")}`}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium text-clay hover:text-forest border border-dashed border-border"
              >
                All camps →
              </a>
            </FilterRow>
          )}

          <div className="space-y-4">
            <FilterRow label="Range countries">
              <FilterChip active={!country} onClick={() => updateParams({ country: null })}>
                All
              </FilterChip>
              {rangeCountries.map((c) => (
                <FilterChip
                  key={c}
                  active={country === c}
                  onClick={() => updateParams({ country: c })}
                >
                  {c}
                </FilterChip>
              ))}
            </FilterRow>

            {countries.length > rangeCountries.length && (
              <FilterRow label="All countries">
                {countries.slice(0, 15).map((c) => (
                  <FilterChip
                    key={c.value}
                    active={country === c.value}
                    onClick={() => updateParams({ country: c.value })}
                  >
                    {c.value} <span className="opacity-60">{c.count}</span>
                  </FilterChip>
                ))}
              </FilterRow>
            )}

            <FilterRow label="Status">
              {statusOptions.map((opt) => (
                <FilterChip
                  key={opt.value}
                  active={(status || "all") === opt.value}
                  onClick={() =>
                    updateParams({ status: opt.value === "all" ? null : opt.value })
                  }
                >
                  {opt.label}
                </FilterChip>
              ))}
            </FilterRow>

            <FilterRow label="Records">
              <FilterChip
                active={!includeUnnamed}
                onClick={() => updateParams({ includeUnnamed: null })}
              >
                Named only
              </FilterChip>
              <FilterChip
                active={includeUnnamed}
                onClick={() => updateParams({ includeUnnamed: "true" })}
              >
                Include unnamed
              </FilterChip>
            </FilterRow>

            <FilterRow label="Sex">
              {sexOptions.map((opt) => (
                <FilterChip
                  key={opt.value}
                  active={(sex || "all") === opt.value}
                  onClick={() => updateParams({ sex: opt.value === "all" ? null : opt.value })}
                >
                  {opt.label}
                </FilterChip>
              ))}
            </FilterRow>

            {categories.length > 0 && (
              <FilterRow label="Facility type">
                <FilterChip active={!category} onClick={() => updateParams({ category: null })}>
                  All
                </FilterChip>
                {categories.map((c) => (
                  <FilterChip
                    key={c.value}
                    active={category === c.value}
                    onClick={() => updateParams({ category: c.value as ElephantCategory })}
                  >
                    {c.value} <span className="opacity-60">{c.count}</span>
                  </FilterChip>
                ))}
              </FilterRow>
            )}

            {subspeciesList.length > 0 && (
              <FilterRow label="Subspecies">
                <FilterChip active={!subspecies} onClick={() => updateParams({ subspecies: null })}>
                  All
                </FilterChip>
                {subspeciesList.map((s) => (
                  <FilterChip
                    key={s.value}
                    active={subspecies === s.value}
                    onClick={() => updateParams({ subspecies: s.value as ElephantSubspecies })}
                  >
                    {s.value} <span className="opacity-60">{s.count}</span>
                  </FilterChip>
                ))}
              </FilterRow>
            )}
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container size="wide">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted">
              {loading
                ? "Searching..."
                : `${result?.total?.toLocaleString() ?? 0} elephant${result?.total === 1 ? "" : "s"}`}
              {result?.source === "local" && !loading && (
                <span className="ml-2 text-xs text-amber-700">(demo seed — set MYSQL_* in .env.local)</span>
              )}
            </p>
            {totalPages > 1 && !loading && (
              <p className="text-sm text-muted">
                Page {page} of {totalPages}
              </p>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-40 rounded-2xl bg-border/40 animate-pulse" />
              ))}
            </div>
          ) : result && result.elephants.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {result.elephants.map((elephant) => (
                <ElephantCard key={elephant.id} elephant={elephant} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted">
              No elephants match. Try a broader search or clear filters.
            </div>
          )}

          {totalPages > 1 && !loading && (
            <div className="flex justify-center gap-2 mt-10 flex-wrap">
              <PaginationButton
                disabled={page <= 1}
                onClick={() => updateParams({ page: String(page - 1) })}
              >
                ← Prev
              </PaginationButton>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let p: number;
                if (totalPages <= 7) p = i + 1;
                else if (page <= 4) p = i + 1;
                else if (page >= totalPages - 3) p = totalPages - 6 + i;
                else p = page - 3 + i;
                return (
                  <PaginationButton
                    key={p}
                    active={p === page}
                    onClick={() => updateParams({ page: String(p) })}
                  >
                    {p}
                  </PaginationButton>
                );
              })}
              <PaginationButton
                disabled={page >= totalPages}
                onClick={() => updateParams({ page: String(page + 1) })}
              >
                Next →
              </PaginationButton>
            </div>
          )}

          <div className="mt-12">
            <ElephantAttribution />
          </div>
        </Container>
      </section>
    </>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-clay mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
        active
          ? "border-forest bg-forest text-ivory"
          : "border-border bg-card text-forest hover:border-forest/30"
      )}
    >
      {children}
    </button>
  );
}

function PaginationButton({
  active,
  disabled,
  onClick,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors",
        active
          ? "border-forest bg-forest text-ivory"
          : "border-border bg-card text-forest hover:border-forest/30",
        disabled && "opacity-40 cursor-not-allowed"
      )}
    >
      {children}
    </button>
  );
}
