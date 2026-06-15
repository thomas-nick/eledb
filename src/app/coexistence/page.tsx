import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RangeMap } from "@/components/map/RangeMap";
import { Stat } from "@/components/ui/Stat";

export const metadata: Metadata = {
  title: "Range Map",
  description:
    "Where wild Asian elephants still roam — 13 range states, migration corridors, and coexistence hotspots across South and Southeast Asia.",
};

const coexistenceStats = [
  { value: "6", label: "Proven Solutions", description: "Documented coexistence programs" },
  { value: "92%", label: "Conflict Reduction", description: "Best-case crop raid decrease" },
  { value: "14,000+", label: "People Protected", description: "Across hotspot communities" },
  { value: "5", label: "Corridor Links", description: "Critical migration routes mapped" },
];

export default function CoexistencePage() {
  return (
    <>
      <section className="py-16 md:py-24 bg-forest text-ivory">
        <Container>
          <SectionHeading
            eyebrow="Wild Range"
            title="Where Asian Elephants Still Roam"
            description="Thirteen countries, fragmented forests, and the corridors that connect them. Hover a country for population data; click orange dots for coexistence stories from the field."
          />
        </Container>
      </section>

      <section className="py-12 bg-sage/10">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {coexistenceStats.map((stat) => (
              <Stat key={stat.label} {...stat} />
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container size="wide">
          <RangeMap />
        </Container>
      </section>
    </>
  );
}
