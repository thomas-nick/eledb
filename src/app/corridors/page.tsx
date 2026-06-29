import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ExplorePageHeader } from "@/components/layout/ExplorePageHeader";
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
    <div className="bg-slate-50 min-h-screen">
      <ExplorePageHeader
        eyebrow="Wild corridors"
        title="Land Bridges Between Herds"
        description={
          <>
            Wild elephant populations are islands — cut off by farms, highways, and plantations.
            Corridors reconnect them. See also the{" "}
            <Link href="/coexistence" className="text-forest font-medium hover:underline">
              Range Map
            </Link>{" "}
            for geographic context.
          </>
        }
      />

      <section className="py-8 md:py-10">
        <Container size="wide">
          <p className="text-sm text-slate-500 mb-6">
            Five high-priority land bridges across the range. Hectare figures are estimates from
            published project reports.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {corridors.map((corridor) => (
              <CorridorCard key={corridor.id} corridor={corridor} />
            ))}
          </div>
        </Container>
      </section>

      <section className="py-8 md:py-10 border-t border-slate-200 bg-white">
        <Container size="wide">
          <DnaExplainer />
        </Container>
      </section>
    </div>
  );
}
