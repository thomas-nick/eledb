import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { ElephantAttribution } from "@/components/elephants/ElephantAttribution";
import { ElephantDetailPanels } from "@/components/elephants/ElephantDetailPanels";
import { ElephantEnrichmentStory } from "@/components/elephants/ElephantEnrichmentStory";
import { ElephantHerdSection } from "@/components/elephants/ElephantHerdSection";
import { ElephantLineageSection } from "@/components/elephants/ElephantLineageSection";
import { ElephantPhotoGallery } from "@/components/elephants/ElephantPhotoGallery";
import { ElephantProfileHero } from "@/components/elephants/ElephantProfileHero";
import { ElephantQuickStats } from "@/components/elephants/ElephantQuickStats";
import { ElephantUnnamedBanner } from "@/components/elephants/ElephantUnnamedBanner";
import { displayElephantName, isUnnamedRecord } from "@/lib/elephantNames";
import {
  getElephantEnrichment,
  mergeProfilePhotos,
} from "@/lib/elephantEnrichments";
import { resolveElephantPhotoUrl } from "@/lib/elephantSe";
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
  const enrichment = await getElephantEnrichment(id);
  const title = displayElephantName(elephant);
  const description =
    enrichment?.teaser ??
    `Asian elephant record for ${title} at ${elephant.locationName}, ${elephant.country}.`;
  const photos = mergeProfilePhotos(elephant.photos, enrichment);
  const photo = photos[0];

  return {
    title: `${title} — ${elephant.locationName}`,
    description,
    openGraph: {
      title: `${title} — ${elephant.locationName}`,
      description,
      type: "profile",
      ...(photo && {
        images: [
          {
            url: photo.url.startsWith("http") ? photo.url : resolveElephantPhotoUrl(photo.url),
            alt: photo.credit ?? title,
          },
        ],
      }),
    },
  };
}

export default async function ElephantDetailPage({ params }: PageProps) {
  const { id } = await params;
  const elephant = await getElephantById(id);
  if (!elephant) notFound();

  const [offspring, herdMates, father, mother, enrichment] = await Promise.all([
    getOffspring(id),
    elephant.locationId ? getHerdMates(elephant.locationId, id) : Promise.resolve([]),
    elephant.fatherId ? getElephantById(elephant.fatherId) : Promise.resolve(null),
    elephant.motherId ? getElephantById(elephant.motherId) : Promise.resolve(null),
    getElephantEnrichment(id),
  ]);

  const linkedSanctuaryIds = elephant.locationId
    ? getSanctuaryIdsForLocation(elephant.locationId)
    : [];
  const linkedSanctuaries = sanctuaries.filter((s) => linkedSanctuaryIds.includes(s.id));
  const unnamed = isUnnamedRecord(elephant);
  const displayName = displayElephantName(elephant);
  const namedHerdMateCount = herdMates.filter((m) => !isUnnamedRecord(m)).length;
  const photos = mergeProfilePhotos(elephant.photos, enrichment);

  return (
    <>
      <ElephantProfileHero elephant={elephant} photos={photos} />

      <div className="relative z-20 -mt-24 md:-mt-28">
        <Container size="wide">
          <ElephantQuickStats
            elephant={elephant}
            offspringCount={offspring.length}
            herdMateCount={herdMates.length}
            namedHerdMateCount={namedHerdMateCount}
          />
        </Container>
      </div>

      <section className="py-10 md:py-14">
        <Container size="wide">
          {photos.length > 0 && (
            <ElephantPhotoGallery photos={photos} elephantName={displayName} />
          )}

          {enrichment && <ElephantEnrichmentStory enrichment={enrichment} />}

          {unnamed && !enrichment && <ElephantUnnamedBanner elephant={elephant} />}

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
