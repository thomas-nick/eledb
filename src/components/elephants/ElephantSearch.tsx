"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { track } from "@/lib/analytics";
import { categoryLabels, facetLabel, subspeciesLabels } from "@/lib/elephantLabels";

const statusOptions: { value: ElephantStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "living", label: "Living" },
  { value: "deceased", label: "Deceased" },
];

const sexOptions: { value: ElephantSex | "all"; label: string }[] = [
  { value: "all", label: "All sexes" },
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
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

const suggestedCamps = [
  { id: "174", name: "Elephant Nature Park", country: "Thailand" },
  { id: "2627", name: "Wildlife SOS", country: "India" },
];

const exploreLinks = [
  { href: "/countries", label: "Countries" },
  { href: "/camps", label: "Camps" },
  { href: "/coexistence", label: "Range map" },
  { href: "/corridors", label: "Corridors" },
];

export function ElephantSearch() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [result, setResult] = useState<ElephantSearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [campChips, setCampChips] = useState<LocationSummary[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filtersPanelId = "elephant-filters-panel";

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
  const hasStory = searchParams.get("hasStory") === "true";

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

  const activeFilters = useMemo(() => {
    const chips: { key: string; label: string; clear: Record<string, string | null> }[] = [];
    const q = searchParams.get("q")?.trim();
    if (q) chips.push({ key: "q", label: `"${q}"`, clear: { q: null } });
    if (country) chips.push({ key: "country", label: country, clear: { country: null } });
    if (status) {
      const label = statusOptions.find((o) => o.value === status)?.label ?? status;
      chips.push({ key: "status", label, clear: { status: null } });
    }
    if (sex) {
      const label = sexOptions.find((o) => o.value === sex)?.label ?? sex;
      chips.push({ key: "sex", label, clear: { sex: null } });
    }
    if (subspecies) {
      chips.push({
        key: "subspecies",
        label: subspeciesLabels[subspecies] ?? subspecies,
        clear: { subspecies: null },
      });
    }
    if (category) {
      chips.push({
        key: "category",
        label: categoryLabels[category] ?? category,
        clear: { category: null },
      });
    }
    if (locationId || locationName) {
      chips.push({
        key: "location",
        label: locationName || `Location #${locationId}`,
        clear: { locationId: null, locationName: null },
      });
    }
    if (!includeUnnamed) {
      chips.push({ key: "named", label: "Named only", clear: { includeUnnamed: "true" } });
    }
    if (hasStory) {
      chips.push({ key: "hasStory", label: "Has sanctuary story", clear: { hasStory: null } });
    }
    return chips;
  }, [searchParams, country, status, sex, subspecies, category, locationId, locationName, includeUnnamed, hasStory]);

  const clearAllFilters = useCallback(() => {
    router.replace(pathname, { scroll: false });
    setQuery("");
  }, [pathname, router]);

  useEffect(() => {
    if (!filtersOpen) return;
    const mq = window.matchMedia("(max-width: 767px)");
    if (!mq.matches) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [filtersOpen]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }
      if (e.key === "/") {
        e.preventDefault();
        document.getElementById("elephant-search-input")?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

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
    if (hasStory) params.set("hasStory", "true");
    params.set("page", String(page));

    setLoading(true);
    setFetchError(null);
    fetch(`/api/elephants/search?${params}`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error("Search failed");
        return r.json();
      })
      .then((data: ElephantSearchResult) => {
        setResult(data);
        setFetchError(null);
      })
      .catch((err) => {
        if (err?.name !== "AbortError") {
          setFetchError("Could not load results. Check your connection and try again.");
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [searchParams, country, status, sex, subspecies, category, sort, page, locationId, locationName, includeUnnamed, hasStory]);

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
      if (q) track("search", { source: "database", query: q });
      updateParams({ q: q || null });
    }, 300);
    return () => clearTimeout(timer);
  }, [query, searchParams, updateParams]);

  const countries = result?.facets.countries ?? [];
  const categories = result?.facets.categories ?? [];
  const subspeciesList = result?.facets.subspecies ?? [];
  const locationFacets = result?.facets.locations ?? [];
  const statusFacets = result?.facets.statuses ?? [];
  const sexFacets = result?.facets.sexes ?? [];
  const totalPages = result ? Math.ceil(result.total / result.perPage) : 0;
  const activeFilterCount = activeFilters.length;

  const facetCount = useCallback(
    (facets: { value: string; count: number }[], value: string) =>
      facets.find((f) => f.value === value)?.count,
    []
  );

  const topLocations = useMemo(
    () =>
      locationFacets
        .filter((l) => l.value && l.value !== "Unknown" && l.count > 0)
        .slice(0, 8),
    [locationFacets]
  );

  const topCountries = useMemo(() => {
    if (countries.length > 0) return countries.slice(0, 9);
    return rangeCountries.map((value) => ({ value, count: 0 }));
  }, [countries]);

  const featuredCamps = useMemo(() => {
    const seen = new Set<string>();
    const list: { id: string; name: string; country?: string }[] = [];
    for (const camp of suggestedCamps) {
      if (seen.has(camp.id)) continue;
      seen.add(camp.id);
      list.push(camp);
    }
    for (const camp of campChips) {
      if (seen.has(camp.id) || list.length >= 5) continue;
      seen.add(camp.id);
      list.push({ id: camp.id, name: camp.displayName, country: camp.country });
    }
    return list;
  }, [campChips]);

  return (
    <div className="bg-slate-50 min-h-screen">
      <section className="sticky top-16 z-20 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <Container size="wide" className="py-3">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                id="elephant-search-input"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, camp, country, chip ID, parent..."
                aria-label="Search elephants"
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-forest focus:ring-1 focus:ring-forest"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => updateParams({ sort: e.target.value })}
              aria-label="Sort by"
              className="px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm shrink-0 focus:outline-none focus:border-forest focus:ring-1 focus:ring-forest"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setFiltersOpen((o) => !o)}
              aria-label="Toggle filters"
              aria-expanded={filtersOpen}
              aria-controls={filtersPanelId}
              className={cn(
                "inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg border text-sm font-medium transition-colors shrink-0",
                filtersOpen || activeFilterCount > 0
                  ? "border-forest bg-forest text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
              )}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M6 12h12M10 20h4" />
              </svg>
              Filters
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full bg-white/20 text-xs">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
              {activeFilters.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => updateParams(chip.clear)}
                  className="inline-flex items-center gap-1.5 pl-2.5 pr-2 py-1 rounded-md text-xs font-medium border border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900 transition-colors"
                >
                  {chip.label}
                  <span className="text-slate-400" aria-hidden>
                    ×
                  </span>
                </button>
              ))}
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs text-forest hover:text-forest-light font-medium ml-1"
              >
                Clear all
              </button>
            </div>
          )}

        </Container>
      </section>

      {filtersOpen && (
        <>
          <button
            type="button"
            aria-label="Close filters"
            className="fixed inset-0 z-30 bg-slate-900/40 md:hidden"
            onClick={() => setFiltersOpen(false)}
          />
          <section
            id={filtersPanelId}
            className="fixed inset-x-0 top-[8.5rem] bottom-0 z-40 overflow-y-auto border-b border-slate-200 bg-white shadow-xl md:static md:z-auto md:max-h-[min(70vh,640px)] md:shadow-none"
          >
            <Container size="wide" className="py-4 md:py-5">
              <div className="flex items-center justify-between mb-4 md:hidden">
                <p className="text-sm font-semibold text-slate-900">Filters & browse</p>
                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  className="rounded-md px-2 py-1 text-sm text-slate-500 hover:text-slate-900"
                >
                  Done
                </button>
              </div>
              <div className="space-y-4 pb-6">
              <FilterRow label="Quick filters">
                <FilterChip active={!includeUnnamed} onClick={() => updateParams({ includeUnnamed: null })}>
                  Named only
                </FilterChip>
                <FilterChip
                  active={includeUnnamed}
                  onClick={() => updateParams({ includeUnnamed: "true" })}
                >
                  Include unnamed
                </FilterChip>
                <FilterChip
                  active={status === "living"}
                  onClick={() => updateParams({ status: status === "living" ? null : "living" })}
                >
                  Living
                  {facetCount(statusFacets, "living") != null && (
                    <span className="opacity-50">{facetCount(statusFacets, "living")!.toLocaleString()}</span>
                  )}
                </FilterChip>
                <FilterChip
                  active={sex === "female"}
                  onClick={() => updateParams({ sex: sex === "female" ? null : "female" })}
                >
                  Female
                  {facetCount(sexFacets, "female") != null && (
                    <span className="opacity-50">{facetCount(sexFacets, "female")!.toLocaleString()}</span>
                  )}
                </FilterChip>
                <FilterChip
                  active={sex === "male"}
                  onClick={() => updateParams({ sex: sex === "male" ? null : "male" })}
                >
                  Male
                  {facetCount(sexFacets, "male") != null && (
                    <span className="opacity-50">{facetCount(sexFacets, "male")!.toLocaleString()}</span>
                  )}
                </FilterChip>
                <FilterChip
                  active={hasStory}
                  onClick={() => updateParams({ hasStory: hasStory ? null : "true" })}
                >
                  Has story
                </FilterChip>
                <FilterChip
                  active={category === "camp"}
                  onClick={() => updateParams({ category: category === "camp" ? null : "camp" })}
                >
                  In camps
                  {facetCount(categories, "camp") != null && (
                    <span className="opacity-50">{facetCount(categories, "camp")!.toLocaleString()}</span>
                  )}
                </FilterChip>
              </FilterRow>

              {(locationName || locationId) && (
                <FilterRow label="Facility">
                  {locationId ? (
                    <a
                      href={`/camps/${locationId}`}
                      className="text-sm font-medium text-forest hover:text-forest-light"
                    >
                      {locationName || `Location #${locationId}`}
                    </a>
                  ) : (
                    <span className="text-sm font-medium text-slate-700">{locationName}</span>
                  )}
                  <button
                    type="button"
                    onClick={() => updateParams({ locationId: null, locationName: null })}
                    className="text-sm text-forest hover:text-forest-light ml-2"
                  >
                    Clear
                  </button>
                </FilterRow>
              )}

              <FilterRow label="Countries">
                <FilterChip active={!country} onClick={() => updateParams({ country: null })}>
                  All
                </FilterChip>
                {topCountries.map((c) => (
                  <FilterChip
                    key={c.value}
                    active={country === c.value}
                    onClick={() => updateParams({ country: country === c.value ? null : c.value })}
                  >
                    {c.value}
                    {c.count > 0 && (
                      <span className="opacity-50">{c.count.toLocaleString()}</span>
                    )}
                  </FilterChip>
                ))}
                <Link
                  href="/countries"
                  className="inline-flex items-center px-2.5 py-1 rounded-md text-[13px] font-medium text-forest hover:text-forest-light"
                >
                  All range states →
                </Link>
              </FilterRow>

              {!locationId && topLocations.length > 0 && (
                <FilterRow label="Top facilities">
                  {topLocations.map((loc) => (
                    <FilterChip
                      key={loc.value}
                      active={locationName === loc.value}
                      onClick={() =>
                        updateParams({
                          locationName: locationName === loc.value ? null : loc.value,
                          locationId: null,
                        })
                      }
                    >
                      {loc.value}
                      <span className="opacity-50">{loc.count.toLocaleString()}</span>
                    </FilterChip>
                  ))}
                </FilterRow>
              )}

              {!locationId && featuredCamps.length > 0 && (
                <FilterRow label="Featured camps">
                  {featuredCamps.map((camp) => (
                    <FilterChip
                      key={camp.id}
                      active={locationId === camp.id}
                      onClick={() =>
                        updateParams({
                          locationId: camp.id,
                          locationName: camp.name,
                          category: "camp",
                          country: camp.country ?? country ?? null,
                        })
                      }
                    >
                      {camp.name}
                    </FilterChip>
                  ))}
                  <Link
                    href={`/camps${country ? `?country=${encodeURIComponent(country)}` : ""}`}
                    className="inline-flex items-center px-2.5 py-1 rounded-md text-[13px] font-medium border border-dashed border-slate-300 text-forest hover:text-forest-light"
                  >
                    All camps →
                  </Link>
                </FilterRow>
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
                      <span className="opacity-50">{loc.livingCount}</span>
                      {loc.sanctuaryIds.length > 0 && (
                        <span className="ml-0.5 text-[10px] text-forest">●</span>
                      )}
                    </FilterChip>
                  ))}
                  <a
                    href={`/camps?country=${encodeURIComponent(country || "Thailand")}`}
                    className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium text-forest hover:text-forest-light border border-dashed border-slate-300"
                  >
                    All camps →
                  </a>
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
                      {facetLabel("category", c.value)}{" "}
                      <span className="opacity-50">{c.count}</span>
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
                      {facetLabel("subspecies", s.value)}{" "}
                      <span className="opacity-50">{s.count}</span>
                    </FilterChip>
                  ))}
                </FilterRow>
              )}

              <FilterRow label="Explore">
                {exploreLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[13px] font-medium border border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:text-slate-900"
                  >
                    {link.label}
                    <span className="text-slate-400" aria-hidden>→</span>
                  </Link>
                ))}
              </FilterRow>
            </div>
          </Container>
        </section>
        </>
      )}

      <section className="py-8">
        <Container size="wide">
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-slate-500">
              {loading ? (
                "Searching..."
              ) : (
                <>
                  <span className="font-semibold text-slate-900">
                    {result?.total?.toLocaleString() ?? 0}
                  </span>{" "}
                  {result?.total === 1 ? "record" : "records"}
                </>
              )}
              {result?.source === "local" && !loading && process.env.NODE_ENV === "development" && (
                <span className="ml-2 text-xs text-amber-700">(demo seed — set MYSQL_* in .env.local)</span>
              )}
              {process.env.NODE_ENV === "development" && result?.source && result.source !== "local" && !loading && (
                <span className="ml-2 text-xs text-slate-400">via {result.source}</span>
              )}
            </p>
            {totalPages > 1 && !loading && (
              <p className="text-sm text-slate-400">
                Page {page} of {totalPages}
              </p>
            )}
          </div>

          {fetchError && !loading && (
            <div
              role="alert"
              className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              <span>{fetchError}</span>
              <button
                type="button"
                onClick={() => updateParams({ page: String(page) })}
                className="rounded-md border border-red-300 bg-white px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-50"
              >
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                  <div className="aspect-[4/3] bg-slate-100 animate-pulse" />
                  <div className="p-3.5 space-y-2">
                    <div className="h-4 bg-slate-100 rounded w-2/3 animate-pulse" />
                    <div className="h-3 bg-slate-100 rounded w-full animate-pulse" />
                    <div className="h-3 bg-slate-100 rounded w-1/2 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : result && result.elephants.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {result.elephants.map((elephant) => (
                <ElephantCard key={elephant.id} elephant={elephant} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 rounded-xl border border-dashed border-slate-300 bg-white">
              <p className="text-base text-slate-900 font-medium mb-1">No records match</p>
              <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
                Try a broader search, clear filters, or browse a well-known sanctuary.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {suggestedCamps.map((camp) => (
                  <a
                    key={camp.id}
                    href={`/camps/${camp.id}`}
                    className="inline-flex items-center px-3.5 py-2 rounded-lg text-sm font-medium border border-slate-300 bg-white text-slate-700 hover:border-forest hover:text-forest transition-colors"
                  >
                    {camp.name}
                  </a>
                ))}
              </div>
              {activeFilters.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-sm text-forest hover:text-forest-light font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}

          {totalPages > 1 && !loading && (
            <div className="flex justify-center gap-1.5 mt-10 flex-wrap">
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
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">{label}</p>
      <div className="flex flex-wrap gap-1.5 items-center">{children}</div>
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
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[13px] font-medium border transition-colors",
        active
          ? "border-forest bg-forest text-white"
          : "border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900"
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
        "px-3 py-1.5 rounded-md text-sm font-medium border transition-colors",
        active
          ? "border-forest bg-forest text-white"
          : "border-slate-300 bg-white text-slate-700 hover:border-slate-400",
        disabled && "opacity-40 cursor-not-allowed"
      )}
    >
      {children}
    </button>
  );
}
