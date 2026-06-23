import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ExplorePageHeader } from "@/components/layout/ExplorePageHeader";
import { CampCard } from "@/components/camps/CampCard";
import { listLocations } from "@/lib/locations";
import { getCountrySlugFromDbName } from "@/data/countryMeta";

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
  searchParams: Promise<{ country?: string; q?: string }>;
}

export default async function CampsPage({ searchParams }: CampsPageProps) {
  const { country = "Thailand", q } = await searchParams;
  const { locations, total, source } = await listLocations({
    country: country === "all" ? undefined : country,
    category: "camp",
    q,
    limit: 60,
  });

  return (
    <div className="bg-slate-50 min-h-screen">
      <ExplorePageHeader
        eyebrow="Facilities"
        title="Elephant Camps & Locations"
        description={`Browse ${total.toLocaleString()} camps and facilities from elephant.se — linked to named elephants and our curated sanctuary directory where available.`}
      />

      <section className="py-4 border-b border-slate-200 bg-white sticky top-16 z-10">
        <Container size="wide">
          <div className="flex flex-wrap gap-1.5 mb-3">
            <CountryLink href="/countries" label="All countries" active={false} />
            <CountryLink href="/camps?country=all" label="All camps" active={country === "all"} />
            {rangeCountries.map((c) => {
              const slug = getCountrySlugFromDbName(c);
              return (
                <CountryLink
                  key={c}
                  href={slug ? `/countries/${slug}` : `/camps?country=${encodeURIComponent(c)}`}
                  label={c}
                  active={country === c}
                />
              );
            })}
          </div>
          <p className="text-sm text-slate-500">
            {total.toLocaleString()} locations
            {source === "local" && (
              <span className="ml-2 text-amber-700">(demo seed — set MYSQL_* for full catalog)</span>
            )}
          </p>
        </Container>
      </section>

      <section className="py-8">
        <Container size="wide">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.map((loc) => (
              <CampCard key={loc.id} location={loc} />
            ))}
          </div>
          {locations.length === 0 && (
            <p className="text-center text-slate-500 py-12">No camps found for this filter.</p>
          )}
        </Container>
      </section>
    </div>
  );
}

function CountryLink({
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
