import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { sanctuaries } from "@/data/sanctuaries";

const pillars = [
  {
    title: "Range & Corridors",
    description:
      "An interactive map of where wild Asian elephants still roam — migration corridors, coexistence hotspots, and the science of keeping fragmented herds connected.",
    href: "/coexistence",
    eyebrow: "Explore",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
  {
    title: "Camps & Sanctuaries",
    description:
      `${sanctuaries.length} places to visit — hands-on mahout experiences, quiet observation sanctuaries, wild safaris. Linked to named elephant records where available.`,
    href: "/sanctuaries",
    eyebrow: "Plan a Visit",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: "Corridor Portal",
    description:
      "Critical land bridges between fragmented wild populations — plus an honest guide to Thailand's microchip/DNA systems and what's actually public.",
    href: "/corridors",
    eyebrow: "Go Deeper",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
];

export function PillarCards() {
  return (
    <section className="py-24">
      <Container>
        <SectionHeading
          eyebrow="Start Here"
          title="Your Asian Elephant Resource"
          description="Whether you're planning a trip to Chiang Mai, curious about wild corridors in Sumatra, or want to understand mahout culture — start here."
        />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pillar) => (
            <Link key={pillar.href} href={pillar.href} className="group">
              <Card hover className="h-full">
                <div className="text-clay mb-4">{pillar.icon}</div>
                <p className="text-xs font-semibold uppercase tracking-widest text-clay mb-2">
                  {pillar.eyebrow}
                </p>
                <h3 className="font-serif text-2xl font-bold text-forest mb-3 group-hover:text-clay transition-colors">
                  {pillar.title}
                </h3>
                <p className="text-muted leading-relaxed">{pillar.description}</p>
                <span className="inline-flex items-center mt-6 text-sm font-medium text-forest group-hover:text-clay transition-colors">
                  Explore
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
