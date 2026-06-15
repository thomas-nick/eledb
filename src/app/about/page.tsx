import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { rangeStates, totalPopulation } from "@/data/rangeStates";
import { sanctuaries } from "@/data/sanctuaries";
import { formatNumber } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About",
  description:
    "A fan resource for Asian elephants — culture, travel, corridors, and sanctuaries across Thailand, Cambodia, and 13 range states.",
};

export default function AboutPage() {
  return (
    <>
      <section className="py-16 md:py-24 bg-forest text-ivory">
        <Container>
          <SectionHeading
            eyebrow="About"
            title="For People Who Love Asian Elephants"
            description="Not a lecture. A resource — built by someone who's been to these places and respects the culture around them."
          />
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            <div>
              <h3 className="font-serif text-2xl font-bold text-forest mb-4">
                Sacred in Thailand, Revered Across Asia
              </h3>
              <p className="text-muted leading-relaxed mb-4">
                In Thailand, the elephant is a national symbol — white elephants are royal, 
                associated with the monarchy and Buddhist tradition for centuries. 
                Chang (ช้าง) appears in art, architecture, and folklore. 
                This isn&apos;t a culture that takes elephants lightly.
              </p>
              <p className="text-muted leading-relaxed">
                Mahouts are often born into the profession — generations caring for the same animal. 
                The bond between a mahout and his elephant is closer than most Western tourists assume. 
                Tourism income, however imperfect, is often what keeps these animals fed when logging and 
                trekking work disappeared.
              </p>
            </div>
            <div>
              <h3 className="font-serif text-2xl font-bold text-forest mb-4">
                How We Approach This Site
              </h3>
              <p className="text-muted leading-relaxed mb-4">
                We&apos;re agnostic. The sanctuary directory tags experiences — hands-on, 
                observation-only, wild safari, mahout culture — and includes welfare references 
                from groups like WAP and ACES for travelers who want them. That&apos;s useful information, 
                not a sermon.
              </p>
              <p className="text-muted leading-relaxed">
                Riding a horse and riding an elephant aren&apos;t the same thing — a 150 lb mahout 
                on a 10,000 lb animal is a different scale entirely, and often how elephants are 
                guided on forest paths. We note what external groups flag; we don&apos;t pretend 
                there&apos;s only one right way to visit.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card>
              <h3 className="font-serif text-xl font-bold text-forest mb-3">
                Plan Your Trip
              </h3>
              <p className="text-muted leading-relaxed">
                {sanctuaries.length} camps and sanctuaries across Thailand, Cambodia, and beyond — 
                filter by experience type, country, or external welfare assessment.
              </p>
            </Card>
            <Card>
              <h3 className="font-serif text-xl font-bold text-forest mb-3">
                Understand the Wild
              </h3>
              <p className="text-muted leading-relaxed">
                The range map shows where wild elephants still exist and where migration corridors 
                connect fragmented populations — arguably the most underappreciated conservation challenge.
              </p>
            </Card>
            <Card>
              <h3 className="font-serif text-xl font-bold text-forest mb-3">
                Read the Field Notes
              </h3>
              <p className="text-muted leading-relaxed">
                Stories from coexistence projects, corridor science, and honest travel context — 
                not guilt-driven tourism advice.
              </p>
            </Card>
          </div>

          <SectionHeading
            eyebrow="Range States"
            title="13 Countries, One Species"
            description={`Roughly ${formatNumber(totalPopulation)} wild Asian elephants remain across 13 range states.`}
          />

          <div className="mt-12 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-clay">Country</th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-clay">Population</th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-clay">Trend</th>
                </tr>
              </thead>
              <tbody>
                {rangeStates.map((state) => (
                  <tr key={state.id} className="border-b border-border/50 hover:bg-forest/5">
                    <td className="py-3 px-4 font-medium text-forest">{state.name}</td>
                    <td className="py-3 px-4 text-muted">{state.population.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-sm capitalize font-medium ${
                          state.populationTrend === "increasing"
                            ? "text-green-700"
                            : state.populationTrend === "declining"
                            ? "text-red-600"
                            : "text-forest"
                        }`}
                      >
                        {state.populationTrend}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-16 flex flex-wrap gap-4 justify-center">
            <Button href="/sanctuaries" size="lg">Browse Sanctuaries</Button>
            <Button href="/corridors" variant="outline" size="lg">Explore Corridors</Button>
          </div>
        </Container>
      </section>
    </>
  );
}
