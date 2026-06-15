import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CorridorCard } from "@/components/corridors/CorridorCard";
import { DnaExplainer } from "@/components/corridors/DnaExplainer";
import { corridors } from "@/data/corridors";

export const metadata: Metadata = {
  title: "Wild Corridors & Elephant Genetics",
  description:
    "Critical land bridges between fragmented wild elephant populations — plus an honest guide to Thailand's microchip/DNA systems and what data is actually public.",
};

export default function CorridorsPage() {
  return (
    <>
      <section className="py-16 md:py-24 bg-forest text-ivory">
        <Container>
          <SectionHeading
            eyebrow="Wild Corridors"
            title="Land Bridges Between Herds"
            description="Wild elephant populations are islands — cut off by farms, highways, and plantations. Corridors reconnect them. Genetics tells us whether those connections are working. This page covers both: real corridor projects and the science behind them — without the fake sponsor dashboards."
          />
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container size="wide">
          <SectionHeading
            title="Critical Corridors"
            description="Five high-priority land bridges across the range. Hectare figures are estimates from published project reports — not live funding trackers."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
            {corridors.map((corridor) => (
              <CorridorCard key={corridor.id} corridor={corridor} />
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-24 bg-sage/10">
        <Container size="wide">
          <DnaExplainer />
        </Container>
      </section>
    </>
  );
}
