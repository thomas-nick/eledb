import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { CampCard } from "@/components/camps/CampCard";
import { listLocations } from "@/lib/locations";

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
    <>
      <section className="py-16 md:py-24 bg-forest text-ivory">
        <Container>
          <p className="text-sm font-semibold uppercase tracking-widest text-clay mb-3">
            Facilities
          </p>
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
            Elephant Camps & Locations
          </h1>
          <p className="mt-4 text-lg text-ivory/80 max-w-2xl leading-relaxed">
            Browse {total.toLocaleString()} camps and facilities from elephant.se — linked to named
            elephants and our curated sanctuary directory where available.
          </p>
        </Container>
      </section>

      <section className="py-10 border-b border-border bg-sage/10">
        <Container size="wide">
          <div className="flex flex-wrap gap-2 mb-6">
            <CountryLink href="/camps" label="All" active={country === "all"} />
            {rangeCountries.map((c) => (
              <CountryLink
                key={c}
                href={`/camps?country=${encodeURIComponent(c)}`}
                label={c}
                active={country === c}
              />
            ))}
          </div>
          <p className="text-sm text-muted">
            {total.toLocaleString()} locations
            {source === "local" && (
              <span className="ml-2 text-amber-700">(demo seed — set MYSQL_* for full catalog)</span>
            )}
          </p>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container size="wide">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {locations.map((loc) => (
              <CampCard key={loc.id} location={loc} />
            ))}
          </div>
          {locations.length === 0 && (
            <p className="text-center text-muted py-12">No camps found for this filter.</p>
          )}
        </Container>
      </section>
    </>
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
      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
        active
          ? "border-forest bg-forest text-ivory"
          : "border-border bg-card text-forest hover:border-forest/30"
      }`}
    >
      {label}
    </Link>
  );
}
