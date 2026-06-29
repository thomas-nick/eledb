import Link from "next/link";
import { Container } from "@/components/ui/Container";
import type { CountryMeta } from "@/data/countryMeta";
import type { RangeState } from "@/data/rangeStates";
import { getCountryTheme, COUNTRY_MAP_VIEWBOX } from "@/data/countryMeta";
import { mapPaths } from "@/data/mapGeometry";
import { elephantSeCountryUrl } from "@/lib/elephantSe";

interface CountryHeroProps {
  meta: CountryMeta;
  range: RangeState | null;
}

const trendLabel = {
  declining: "Declining",
  stable: "Stable",
  increasing: "Increasing",
} as const;

const trendDot = {
  declining: "bg-amber-300",
  stable: "bg-white/80",
  increasing: "bg-emerald-300",
} as const;

export function CountryHero({ meta, range }: CountryHeroProps) {
  const theme = getCountryTheme(meta);

  return (
    <section
      className="relative overflow-hidden text-white"
      style={{ background: theme.gradient }}
    >
      <DotPattern accent={theme.accent} />
      <RegionalMapArt activeSlug={meta.slug} />

      <Container size="wide" className="relative py-12 md:py-16">
        <Link
          href="/countries"
          className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white mb-8 transition-colors"
        >
          <span aria-hidden>←</span> All range states
        </Link>

        <div className="grid lg:grid-cols-[1fr_auto] gap-8 lg:gap-12 items-end">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span
                className="text-xs font-semibold uppercase tracking-[0.18em]"
                style={{ color: theme.accent }}
              >
                Range state
              </span>
              <span className="text-white/30">·</span>
              <span className="text-xs uppercase tracking-wider text-white/60">
                {meta.region === "south-asia" ? "South Asia" : "Southeast Asia"}
              </span>
            </div>

            <div className="flex items-end gap-5 flex-wrap">
              <span
                className="text-6xl md:text-7xl leading-none drop-shadow-md select-none"
                aria-hidden
              >
                {meta.flag}
              </span>
              <div className="min-w-0">
                <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight leading-none">
                  {meta.title}
                </h1>
                <p className="mt-3 text-lg text-white/85 max-w-xl leading-snug">
                  {meta.tagline}
                </p>
              </div>
            </div>

            <p className="mt-7 text-[15px] text-white/75 leading-relaxed max-w-2xl">
              {meta.overview}
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-6">
              <Pill>
                <span className="text-white/60">Subspecies</span>
                <span className="text-white">{meta.subspecies}</span>
              </Pill>
              {range && (
                <Pill>
                  <span
                    className={`inline-block w-1.5 h-1.5 rounded-full ${
                      trendDot[range.populationTrend]
                    }`}
                  />
                  <span className="text-white/60">Trend</span>
                  <span className="text-white">{trendLabel[range.populationTrend]}</span>
                </Pill>
              )}
              {range && (
                <Pill>
                  <span className="text-white/60">Wild</span>
                  <span className="text-white tabular-nums">
                    ~{range.population.toLocaleString()}
                  </span>
                </Pill>
              )}
            </div>

            <div className="flex flex-wrap gap-3 mt-8">
              <Link
                href={`/elephants?country=${encodeURIComponent(meta.dbCountry)}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-white/90 shadow-lg shadow-black/20 transition-colors"
              >
                Browse all records
                <span aria-hidden>→</span>
              </Link>
              <Link
                href={`/camps?country=${encodeURIComponent(meta.dbCountry)}`}
                className="inline-flex items-center rounded-lg border border-white/25 bg-white/5 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition-colors backdrop-blur-sm"
              >
                View camps
              </Link>
              <a
                href={elephantSeCountryUrl(meta.dbCountry)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-white/70 hover:text-white px-2 py-2.5 transition-colors"
              >
                elephant.se
                <span aria-hidden>↗</span>
              </a>
            </div>
          </div>

          <CountryMapBadge meta={meta} accent={theme.accent} />
        </div>
      </Container>
    </section>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/8 ring-1 ring-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
      {children}
    </span>
  );
}

function DotPattern({ accent }: { accent: string }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none"
      aria-hidden
    >
      <defs>
        <pattern id="hero-dots" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill={accent} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hero-dots)" />
    </svg>
  );
}

/** Subtle full-region map silhouette in the background */
function RegionalMapArt({ activeSlug }: { activeSlug: string }) {
  return (
    <div
      className="absolute -right-24 -bottom-16 w-[640px] max-w-[70%] opacity-[0.18] pointer-events-none hidden md:block"
      aria-hidden
    >
      <svg viewBox={COUNTRY_MAP_VIEWBOX} className="w-full h-auto">
        {Object.entries(mapPaths).map(([key, d]) => {
          const normalized = key === "sriLanka" ? "sri-lanka" : key;
          if (normalized === activeSlug) return null;
          return (
            <path
              key={key}
              d={d}
              fill="none"
              stroke="rgba(255,255,255,0.45)"
              strokeWidth={1.2}
            />
          );
        })}
      </svg>
    </div>
  );
}

/** A larger "stamp" of the active country's shape on the right */
function CountryMapBadge({ meta, accent }: { meta: CountryMeta; accent: string }) {
  if (!meta.mapPath) return null;
  return (
    <div className="hidden lg:flex flex-col items-center justify-end pr-2">
      <div className="relative w-44 h-44 rounded-2xl ring-1 ring-white/15 bg-white/[0.04] backdrop-blur-sm overflow-hidden">
        <svg
          viewBox={COUNTRY_MAP_VIEWBOX}
          className="absolute inset-0 w-full h-full p-3"
          preserveAspectRatio="xMidYMid meet"
        >
          {Object.entries(mapPaths).map(([key, d]) => {
            const normalized = key === "sriLanka" ? "sri-lanka" : key;
            const active = normalized === meta.slug;
            return (
              <path
                key={key}
                d={d}
                fill={active ? accent : "rgba(255,255,255,0.08)"}
                stroke={active ? accent : "rgba(255,255,255,0.18)"}
                strokeWidth={active ? 2 : 1}
              />
            );
          })}
        </svg>
      </div>
      <p
        className="mt-3 text-[10px] uppercase tracking-[0.18em] font-semibold"
        style={{ color: accent }}
      >
        Asian range
      </p>
    </div>
  );
}
