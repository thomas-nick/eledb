import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ExplorePageHeader } from "@/components/layout/ExplorePageHeader";
import { getCountryIndexData, type CountryIndexItem } from "@/lib/countries";
import { getCountryTheme, COUNTRY_MAP_VIEWBOX } from "@/data/countryMeta";
import { mapPaths } from "@/data/mapGeometry";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Asian Elephant Range States",
  description:
    "Country hubs for all 13 Asian elephant range states — wild population context, database records, camps, corridors, and field stories.",
  path: "/countries",
});

export const dynamic = "force-dynamic";

const trendLabel = {
  declining: "Declining",
  stable: "Stable",
  increasing: "Increasing",
} as const;

const trendColor = {
  declining: "#f3c98a",
  stable: "#cbd5e1",
  increasing: "#a3eba8",
} as const;

const regionLabel = {
  "south-asia": "South Asia",
  "southeast-asia": "Southeast Asia",
};

export default async function CountriesIndexPage() {
  const countries = await getCountryIndexData();

  const featured = countries.slice(0, 3);
  const remaining = countries.slice(3);
  const southAsia = remaining.filter((c) => c.meta.region === "south-asia");
  const southeastAsia = remaining.filter((c) => c.meta.region === "southeast-asia");

  return (
    <div className="bg-slate-50 min-h-screen">
      <ExplorePageHeader
        eyebrow="Range states"
        title="13 Asian Elephant Range States"
        description="Each country has a dedicated hub with wild population data, elephant.se records, camps, sanctuaries, and field stories — from India to Sumatra."
      />

      <section className="py-10 md:py-12">
        <Container size="wide">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 mb-4">
            Featured
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {featured.map((item) => (
              <CountryCard key={item.meta.slug} item={item} variant="featured" />
            ))}
          </div>
        </Container>
      </section>

      {southeastAsia.length > 0 && (
        <CountryGroup label="Southeast Asia" countries={southeastAsia} />
      )}
      {southAsia.length > 0 && <CountryGroup label="South Asia" countries={southAsia} />}

      <div className="h-10" />
    </div>
  );
}

function CountryGroup({
  label,
  countries,
}: {
  label: string;
  countries: CountryIndexItem[];
}) {
  return (
    <section className="py-6 md:py-10 border-t border-slate-200">
      <Container size="wide">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 mb-4">
          {label}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {countries.map((item) => (
            <CountryCard key={item.meta.slug} item={item} variant="standard" />
          ))}
        </div>
      </Container>
    </section>
  );
}

function CountryCard({
  item,
  variant,
}: {
  item: CountryIndexItem;
  variant: "featured" | "standard";
}) {
  const { meta, range, stats } = item;
  const theme = getCountryTheme(meta);
  const isFeatured = variant === "featured";

  return (
    <Link
      href={`/countries/${meta.slug}`}
      className="group relative overflow-hidden rounded-2xl flex flex-col text-white transition-transform hover:-translate-y-0.5"
      style={{ background: theme.gradient }}
    >
      <CardMapArt slug={meta.slug} accent={theme.accent} featured={isFeatured} />

      <div className="relative p-5 md:p-6 flex flex-col h-full min-h-[220px]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className={`leading-none drop-shadow-md ${isFeatured ? "text-4xl" : "text-3xl"}`}
              aria-hidden
            >
              {meta.flag}
            </span>
            <div className="min-w-0">
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: theme.accent }}
              >
                {regionLabel[meta.region]}
              </p>
              <h3
                className={`font-serif font-bold leading-tight ${
                  isFeatured ? "text-2xl" : "text-xl"
                }`}
              >
                {meta.title}
              </h3>
            </div>
          </div>
          {range && (
            <span
              className="shrink-0 inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-medium ring-1 ring-white/15"
              style={{ color: trendColor[range.populationTrend] }}
            >
              {trendLabel[range.populationTrend]}
            </span>
          )}
        </div>

        <p className="text-sm text-white/80 leading-snug mt-3 line-clamp-2 min-h-[2.5rem]">
          {meta.tagline}
        </p>

        <div className="mt-auto pt-5">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-white/90">
            {range && (
              <Stat label="Wild" value={`~${formatCompact(range.population)}`} accent={theme.accent} />
            )}
            <Stat label="Records" value={formatCompact(stats.total)} accent={theme.accent} />
            <Stat label="Camps" value={stats.campCount.toString()} accent={theme.accent} />
          </div>
          <div
            className="flex items-center gap-1 text-sm font-medium mt-4 transition-opacity opacity-90 group-hover:opacity-100"
            style={{ color: theme.accent }}
          >
            Open hub
            <span aria-hidden>→</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-base font-bold tabular-nums" style={{ color: accent }}>
        {value}
      </span>
      <span className="text-[10px] uppercase tracking-wider text-white/60">{label}</span>
    </div>
  );
}

function CardMapArt({
  slug,
  accent,
  featured,
}: {
  slug: string;
  accent: string;
  featured: boolean;
}) {
  return (
    <div
      className={`absolute pointer-events-none ${
        featured
          ? "-right-10 -bottom-10 w-56 opacity-[0.18]"
          : "-right-8 -bottom-8 w-44 opacity-[0.15]"
      }`}
      aria-hidden
    >
      <svg viewBox={COUNTRY_MAP_VIEWBOX} className="w-full h-auto">
        {Object.entries(mapPaths).map(([key, d]) => {
          const normalized = key === "sriLanka" ? "sri-lanka" : key;
          const active = normalized === slug;
          return (
            <path
              key={key}
              d={d}
              fill={active ? accent : "none"}
              stroke={active ? accent : "rgba(255,255,255,0.4)"}
              strokeWidth={active ? 2 : 1}
            />
          );
        })}
      </svg>
    </div>
  );
}

function formatCompact(n: number): string {
  if (n >= 10000) return `${(n / 1000).toFixed(0)}k`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString();
}
