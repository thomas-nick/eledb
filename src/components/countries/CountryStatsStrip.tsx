import type { CountryDbStats } from "@/lib/countries";
import type { RangeState } from "@/data/rangeStates";
import type { CountryMeta } from "@/data/countryMeta";
import { getCountryTheme } from "@/data/countryMeta";

interface CountryStatsStripProps {
  meta: CountryMeta;
  stats: CountryDbStats;
  range: RangeState | null;
  sanctuaryCount: number;
  hotspotCount: number;
}

type IconName = "globe" | "database" | "heart" | "home" | "shield" | "spark" | "warning";

function Icon({ name, className }: { name: IconName; className?: string }) {
  const common = "w-4 h-4 " + (className ?? "");
  switch (name) {
    case "globe":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        </svg>
      );
    case "database":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M3 5v6c0 1.66 4.03 3 9 3s9-1.34 9-3V5M3 11v6c0 1.66 4.03 3 9 3s9-1.34 9-3v-6" />
        </svg>
      );
    case "heart":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      );
    case "home":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <path d="M3 12l9-8 9 8" />
          <path d="M5 10v10h14V10" />
        </svg>
      );
    case "shield":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z" />
        </svg>
      );
    case "spark":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <path d="M12 3v4M12 17v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M3 12h4M17 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      );
    case "warning":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
  }
}

interface StatItem {
  value: string;
  label: string;
  sub: string;
  icon: IconName;
  primary?: boolean;
}

export function CountryStatsStrip({
  meta,
  stats,
  range,
  sanctuaryCount,
  hotspotCount,
}: CountryStatsStripProps) {
  const theme = getCountryTheme(meta);

  const items: (StatItem | null)[] = [
    range
      ? {
          value: `~${range.population.toLocaleString()}`,
          label: "Wild population",
          sub: "Estimated in range",
          icon: "globe",
          primary: true,
        }
      : null,
    {
      value: stats.total.toLocaleString(),
      label: "Database records",
      sub: "From elephant.se",
      icon: "database",
      primary: true,
    },
    {
      value: stats.living.toLocaleString(),
      label: "Living",
      sub: `${stats.named.toLocaleString()} named`,
      icon: "heart",
      primary: true,
    },
    {
      value: stats.campCount.toLocaleString(),
      label: "Camps",
      sub: "Distinct facilities",
      icon: "home",
      primary: true,
    },
    sanctuaryCount > 0
      ? {
          value: sanctuaryCount.toLocaleString(),
          label: "Sanctuaries",
          sub: "Curated directory",
          icon: "shield",
        }
      : null,
    hotspotCount > 0
      ? {
          value: hotspotCount.toLocaleString(),
          label: "Hotspots",
          sub: "Coexistence work",
          icon: "spark",
        }
      : null,
    range && range.hecIncidents > 0
      ? {
          value: range.hecIncidents.toLocaleString(),
          label: "HEC / year",
          sub: "Human-elephant conflict",
          icon: "warning",
        }
      : null,
  ];

  const primary = items.filter((i): i is StatItem => Boolean(i?.primary));
  const secondary = items.filter((i): i is StatItem => Boolean(i && !i.primary));

  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {primary.map((item) => (
            <PrimaryCard
              key={item.label}
              item={item}
              accent={theme.accent}
              tint={theme.tint}
              border={theme.border}
            />
          ))}
        </div>
        {secondary.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {secondary.map((item) => (
              <SecondaryChip key={item.label} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function PrimaryCard({
  item,
  tint,
  border,
}: {
  item: StatItem;
  accent: string;
  tint: string;
  border: string;
}) {
  return (
    <div
      className="group relative rounded-xl bg-white p-4 transition-colors hover:bg-slate-50"
      style={{ border: `1px solid ${border}` }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-2xl md:text-3xl font-bold text-slate-900 tabular-nums leading-none">
          {item.value}
        </p>
        <span
          className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-forest"
          style={{ background: tint }}
        >
          <Icon name={item.icon} />
        </span>
      </div>
      <p className="text-sm font-semibold text-slate-900 mt-3">{item.label}</p>
      <p className="text-xs text-slate-500 mt-0.5">{item.sub}</p>
    </div>
  );
}

function SecondaryChip({ item }: { item: StatItem }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3.5 py-1.5 text-sm">
      <Icon name={item.icon} className="text-slate-500" />
      <span className="font-semibold text-slate-900 tabular-nums">{item.value}</span>
      <span className="text-slate-600">{item.label}</span>
    </div>
  );
}
