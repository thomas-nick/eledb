import { Suspense } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ExplorePageHeader } from "@/components/layout/ExplorePageHeader";
import { CampCard } from "@/components/camps/CampCard";
import { listLocations } from "@/lib/locations";
import { CampsSearchBar } from "@/components/camps/CampsSearchBar";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Elephant Camps & Locations",
  description:
    "Browse elephant camps and facilities across Asia — linked to named elephant records and our curated sanctuary directory.",
  path: "/camps",
});

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

interface CampsPageProps {
  searchParams: Promise<{ country?: string; q?: string; limit?: string }>;
}

export default async function CampsPage({ searchParams }: CampsPageProps) {
  const { country = "all", q, limit: limitParam } = await searchParams;
  const limit = Math.min(120, Math.max(30, Number(limitParam) || 30));
  const { locations, total, source } = await listLocations({
    country: country === "all" ? undefined : country,
    category: "camp",
    q,
    limit,
  });

  const hasMore = locations.length < total;

  return (
    <div className="bg-slate-50 min-h-screen">
      <ExplorePageHeader
        eyebrow="Facilities"
        title="Elephant Camps & Locations"
        description={`Browse ${total.toLocaleString()} camps and facilities from elephant.se — linked to named elephants and our curated sanctuary directory where available.`}
      />

      <section className="py-4 border-b border-slate-200 bg-white sticky top-16 z-10">
        <Container size="wide">
          <Suspense fallback={null}>
            <CampsSearchBar initialQuery={q ?? ""} initialSort="name" />
          </Suspense>
          <div className="flex flex-wrap gap-1.5 mb-3 mt-3">
            <CountryChip href="/camps?country=all" label="All camps" active={country === "all"} />
            {rangeCountries.map((c) => (
              <CountryChip
                key={c}
                href={`/camps?country=${encodeURIComponent(c)}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                label={c}
                active={country === c}
              />
            ))}
            <Link
              href="/countries"
              className="inline-flex items-center px-2.5 py-1 rounded-md text-[13px] font-medium text-forest hover:text-forest-light ml-1"
            >
              All range states →
            </Link>
          </div>
          <p className="text-sm text-slate-500">
            {locations.length.toLocaleString()} of {total.toLocaleString()} locations
            {source === "local" && process.env.NODE_ENV === "development" && (
              <span className="ml-2 text-amber-700">(demo seed — set MYSQL_* for full catalog)</span>
            )}
          </p>
        </Container>
      </section>

      <section className="py-8">
        <Container size="wide">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.map((loc) => (
              <CampCard key={loc.id} location={loc} />
            ))}
          </div>
          {locations.length === 0 && (
            <p className="text-center text-slate-500 py-12">No camps found for this filter.</p>
          )}
          {hasMore && (
            <div className="flex justify-center mt-10">
              <Link
                href={buildLoadMoreHref({ country, q, limit })}
                className="inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-medium border border-slate-300 bg-white text-slate-700 hover:border-forest hover:text-forest transition-colors"
              >
                Load more ({Math.min(limit + 30, total).toLocaleString()} of {total.toLocaleString()})
              </Link>
            </div>
          )}
        </Container>
      </section>
    </div>
  );
}

function CountryChip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`px-2.5 py-1 rounded-md text-[13px] font-medium border transition-colors ${
        active
          ? "border-forest bg-forest text-white"
          : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
      }`}
    >
      {label}
    </Link>
  );
}

function buildLoadMoreHref({
  country,
  q,
  limit,
}: {
  country: string;
  q?: string;
  limit: number;
}) {
  const params = new URLSearchParams();
  if (country && country !== "all") params.set("country", country);
  if (q) params.set("q", q);
  params.set("limit", String(limit + 30));
  const qs = params.toString();
  return qs ? `/camps?${qs}` : "/camps";
}
