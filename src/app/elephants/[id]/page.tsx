import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ElephantAttribution } from "@/components/elephants/ElephantAttribution";
import { ElephantDetailPanels } from "@/components/elephants/ElephantDetailPanels";
import { ElephantEnrichmentStory } from "@/components/elephants/ElephantEnrichmentStory";
import { ElephantHerdSection } from "@/components/elephants/ElephantHerdSection";
import { ElephantLineageSection } from "@/components/elephants/ElephantLineageSection";
import { ElephantPhotoGallery } from "@/components/elephants/ElephantPhotoGallery";
import { ElephantUnnamedBanner } from "@/components/elephants/ElephantUnnamedBanner";
import { ContributionActivity } from "@/components/elephants/ContributionActivity";
import { ProfileHeader } from "@/components/elephants/ProfileHeader";
import { ProfileMetadataStrip } from "@/components/elephants/ProfileMetadataStrip";
import { ProfileTabs } from "@/components/elephants/ProfileTabs";
import { RecordCompleteness } from "@/components/elephants/RecordCompleteness";
import { getCountrySlugFromDbName } from "@/data/countryMeta";
import { displayElephantName, isUnnamedRecord } from "@/lib/elephantNames";
import {
  getCommunityPhotos,
  computeRecordCompleteness,
  listContributionsByElephant,
} from "@/lib/contribution-db";
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
  const communityPhotos = await getCommunityPhotos(id);
  const title = displayElephantName(elephant);
  const description =
    enrichment?.teaser ??
    `Asian elephant record for ${title} at ${elephant.locationName}, ${elephant.country}.`;
  const photos = mergeProfilePhotos(elephant.photos, enrichment, communityPhotos);
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

  const [offspring, herdMates, father, mother, enrichment, communityPhotos, activity] =
    await Promise.all([
      getOffspring(id),
      elephant.locationId ? getHerdMates(elephant.locationId, id) : Promise.resolve([]),
      elephant.fatherId ? getElephantById(elephant.fatherId) : Promise.resolve(null),
      elephant.motherId ? getElephantById(elephant.motherId) : Promise.resolve(null),
      getElephantEnrichment(id),
      getCommunityPhotos(id),
      listContributionsByElephant(id),
    ]);

  const linkedSanctuaryIds = elephant.locationId
    ? getSanctuaryIdsForLocation(elephant.locationId)
    : [];
  const linkedSanctuaries = sanctuaries.filter((s) => linkedSanctuaryIds.includes(s.id));
  const unnamed = isUnnamedRecord(elephant);
  const displayName = displayElephantName(elephant);
  const photos = mergeProfilePhotos(elephant.photos, enrichment, communityPhotos);
  const completeness = computeRecordCompleteness(elephant);

  const countryHubSlug = getCountrySlugFromDbName(elephant.country);
  const breadcrumbItems = [
    { label: "Database", href: "/elephants" },
    countryHubSlug
      ? { label: elephant.country, href: `/countries/${countryHubSlug}` }
      : { label: elephant.country, href: `/elephants?country=${encodeURIComponent(elephant.country)}` },
    ...(elephant.locationId
      ? [
          {
            label: elephant.locationName,
            href: `/camps/${elephant.locationId}`,
          },
        ]
      : [{ label: elephant.locationName }]),
    { label: displayName },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      <Container size="wide" className="py-6 md:py-8">
        <Breadcrumb items={breadcrumbItems} />

        <div className="mt-4 space-y-5">
          <ProfileHeader elephant={elephant} bannerPhoto={photos[0]} />
          <ProfileMetadataStrip elephant={elephant} />
          <RecordCompleteness elephant={elephant} {...completeness} />
        </div>

        <div className="mt-8">
          <ProfileTabs
            overview={
              <div className="space-y-8">
                {enrichment && <ElephantEnrichmentStory enrichment={enrichment} />}
                {unnamed && !enrichment && <ElephantUnnamedBanner elephant={elephant} />}
                <ElephantDetailPanels elephant={elephant} linkedSanctuaries={linkedSanctuaries} />
              </div>
            }
            lineage={
              <ElephantLineageSection
                elephant={elephant}
                father={father}
                mother={mother}
                offspring={offspring}
              />
            }
            herd={<ElephantHerdSection elephant={elephant} herdMates={herdMates} />}
            photos={
              photos.length > 0 ? (
                <ElephantPhotoGallery photos={photos} elephantName={displayName} />
              ) : (
                <p className="text-sm text-slate-500">No photos yet for this record.</p>
              )
            }
            activity={
              <ContributionActivity contributions={activity} syncedAt={elephant.syncedAt} />
            }
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-8 mt-8 border-t border-slate-200">
          <a
            href={elephant.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-forest hover:underline"
          >
            Original record on elephant.se
          </a>
          <Link href="/elephants" className="text-sm text-slate-500 hover:text-forest">
            Back to database
          </Link>
        </div>

        <div className="mt-8">
          <ElephantAttribution compact />
        </div>
      </Container>
    </div>
  );
}
