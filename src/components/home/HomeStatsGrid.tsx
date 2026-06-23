import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { formatStat, type SiteStats } from "@/lib/siteStats";

interface HomeStatsGridProps {
  stats: SiteStats;
}

const statCards = (stats: SiteStats) => [
  {
    value: formatStat(stats.total),
    label: "Total records",
    description: "All elephants in the database",
    href: "/elephants?includeUnnamed=true",
  },
  {
    value: formatStat(stats.named),
    label: "Named elephants",
    description: "Individuals with a known name",
    href: "/elephants",
  },
  {
    value: formatStat(stats.living),
    label: "Living",
    description: "Currently alive on record",
    href: "/elephants?status=living",
  },
  {
    value: formatStat(stats.campCount),
    label: "Camps & facilities",
    description: "Locations with elephant records",
    href: "/camps",
  },
  {
    value: formatStat(stats.countryCount),
    label: "Countries",
    description: "Range states and zoos worldwide",
    href: "/countries",
  },
];

export function HomeStatsGrid({ stats }: HomeStatsGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      {statCards(stats).map((card) => (
        <Link key={card.label} href={card.href} className="group">
          <Card
            hover
            className="h-full p-4 md:p-5 border-slate-200 bg-white group-hover:border-forest/30"
          >
            <p className="font-serif text-2xl md:text-3xl font-bold text-forest tabular-nums">
              {card.value}
            </p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-600">
              {card.label}
            </p>
            <p className="mt-0.5 text-xs text-slate-400 hidden md:block">{card.description}</p>
          </Card>
        </Link>
      ))}
    </div>
  );
}
