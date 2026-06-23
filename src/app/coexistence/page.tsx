import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ExplorePageHeader } from "@/components/layout/ExplorePageHeader";
import { RangeMap } from "@/components/map/RangeMap";

export const metadata: Metadata = {
  title: "Range Map",
  description:
    "Where wild Asian elephants still roam — 13 range states, migration corridors, and coexistence hotspots across South and Southeast Asia.",
};

const rangeStats = [
  { value: "13", label: "Range states", sub: "South & Southeast Asia" },
  { value: "~52k", label: "Wild population", sub: "All range states combined" },
  { value: "6", label: "Field hotspots", sub: "Documented coexistence programs" },
  { value: "5", label: "Corridors", sub: "Mapped migration routes" },
];

export default function CoexistencePage() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <ExplorePageHeader
        eyebrow="Wild range"
        title="Where Asian Elephants Still Roam"
        description="Real geography across 13 range states. Hover countries for population data, click to browse the elephant database, and explore coexistence hotspots on the ground."
      />

      <section className="py-6 border-b border-slate-200 bg-white">
        <Container size="wide">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {rangeStats.map((stat) => (
              <div key={stat.label} className="rounded-lg border border-slate-200 px-4 py-3">
                <p className="text-2xl font-semibold text-forest tabular-nums">{stat.value}</p>
                <p className="text-sm font-medium text-slate-900 mt-0.5">{stat.label}</p>
                <p className="text-xs text-slate-500">{stat.sub}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-8 md:py-10">
        <Container size="wide">
          <RangeMap />
        </Container>
      </section>
    </div>
  );
}
