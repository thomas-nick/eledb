import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { ElephantAttribution } from "@/components/elephants/ElephantAttribution";
import { ElephantDetailPanels } from "@/components/elephants/ElephantDetailPanels";
import { ElephantHerdSection } from "@/components/elephants/ElephantHerdSection";
import { ElephantLineageSection } from "@/components/elephants/ElephantLineageSection";
import { ElephantProfileHero } from "@/components/elephants/ElephantProfileHero";
import { ElephantUnnamedBanner } from "@/components/elephants/ElephantUnnamedBanner";
import { displayElephantName, isUnnamedRecord } from "@/lib/elephantNames";
import { getElephantById, getHerdMates, getOffspring } from "@/lib/elephants";
import { getSanctuaryIdsForLocation } from "@/data/elephantSeLocations";
import { sanctuaries } from "@/data/sanctuaries";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const elephant = await getElephantById(id);
  if (!elephant) return { title: "Elephant not found" };
  const title = displayElephantName(elephant);
  const description = `Asian elephant record for ${title} at ${elephant.locationName}, ${elephant.country}.`;
  const photo = elephant.photos?.[0];

  return {
    title: `${title} — ${elephant.locationName}`,
    description,
    openGraph: {
      title: `${title} — ${elephant.locationName}`,
      description,
      type: "profile",
      ...(photo && {
        images: [{ url: photo.url, alt: photo.credit ?? title }],
      }),
    },
  };
}

export default async function ElephantDetailPage({ params }: PageProps) {
  const { id } = await params;
  const elephant = await getElephantById(id);
  if (!elephant) notFound();

  const [offspring, herdMates, father, mother] = await Promise.all([
    getOffspring(id),
    elephant.locationId ? getHerdMates(elephant.locationId, id) : Promise.resolve([]),
    elephant.fatherId ? getElephantById(elephant.fatherId) : Promise.resolve(null),
    elephant.motherId ? getElephantById(elephant.motherId) : Promise.resolve(null),
  ]);

  const linkedSanctuaryIds = elephant.locationId
    ? getSanctuaryIdsForLocation(elephant.locationId)
    : [];
  const linkedSanctuaries = sanctuaries.filter((s) => linkedSanctuaryIds.includes(s.id));
  const unnamed = isUnnamedRecord(elephant);

  return (
    <>
      <ElephantProfileHero elephant={elephant} />

      <section className="py-12 md:py-16">
        <Container size="wide">
          {unnamed && <ElephantUnnamedBanner elephant={elephant} />}

          <ElephantLineageSection
            elephant={elephant}
            father={father}
            mother={mother}
            offspring={offspring}
          />

          <ElephantHerdSection elephant={elephant} herdMates={herdMates} />

          <ElephantDetailPanels elephant={elephant} linkedSanctuaries={linkedSanctuaries} />

          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-border">
            <a
              href={elephant.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-clay hover:text-forest transition-colors"
            >
              Original record on elephant.se ↗
            </a>
            <Link
              href="/elephants"
              className="text-sm text-muted hover:text-forest transition-colors"
            >
              ← Back to database
            </Link>
          </div>

          <div className="mt-8">
            <ElephantAttribution compact />
          </div>
        </Container>
      </section>
    </>
  );
}
