import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ElephantAttribution } from "@/components/elephants/ElephantAttribution";
import { ProfileHeader } from "@/components/elephants/ProfileHeader";
import { RecordCompleteness } from "@/components/elephants/RecordCompleteness";
import { ElephantProfileTabs } from "@/components/elephants/ElephantProfileTabs";
import { getCountrySlugFromDbName } from "@/data/countryMeta";
import { displayElephantName, isUnnamedRecord } from "@/lib/elephantNames";
import { computeRecordCompleteness } from "@/lib/contribution-db";
import { mergeProfilePhotos } from "@/lib/elephantEnrichments";
import { resolveElephantPhotoUrl } from "@/lib/elephantSe";
import { getSanctuaryIdsForLocation } from "@/data/elephantSeLocations";
import { sanctuaries } from "@/data/sanctuaries";
import { JsonLd } from "@/components/seo/JsonLd";
import { absoluteUrl } from "@/lib/site";
import {
  getCachedCommunityPhotos,
  getCachedElephantById,
  getCachedElephantEnrichment,
  getCachedHerdMates,
  getCachedOffspring,
} from "@/lib/elephant-cache";
import { listContributionsByElephant } from "@/lib/contribution-db";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const elephant = await getCachedElephantById(id);
  if (!elephant) return { title: "Elephant not found" };
  const enrichment = await getCachedElephantEnrichment(id);
  const communityPhotos = await getCachedCommunityPhotos(id);
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
  const elephant = await getCachedElephantById(id);
  if (!elephant) notFound();

  const [offspring, herdMates, father, mother, enrichment, communityPhotos, activity] =
    await Promise.all([
      getCachedOffspring(id),
      elephant.locationId ? getCachedHerdMates(elephant.locationId, id) : Promise.resolve([]),
      elephant.fatherId ? getCachedElephantById(elephant.fatherId) : Promise.resolve(null),
      elephant.motherId ? getCachedElephantById(elephant.motherId) : Promise.resolve(null),
      getCachedElephantEnrichment(id),
      getCachedCommunityPhotos(id),
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${displayName} — ${elephant.locationName}`,
    description: `Asian elephant record for ${displayName} at ${elephant.locationName}, ${elephant.country}.`,
    url: absoluteUrl(`/elephants/${elephant.id}`),
    ...(photos[0] && { primaryImageOfPage: photos[0].url }),
    about: {
      "@type": "Thing",
      name: displayName,
      description: `Asian elephant (${elephant.species}) at ${elephant.locationName}, ${elephant.country}.`,
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbItems.map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: item.label,
        ...(item.href && { item: absoluteUrl(item.href) }),
      })),
    },
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <JsonLd data={jsonLd} />
      <Container size="wide" className="py-6 md:py-8">
        <Breadcrumb items={breadcrumbItems} />

        <div className="mt-4 space-y-5">
          <ProfileHeader elephant={elephant} bannerPhoto={photos[0]} />
          <RecordCompleteness {...completeness} />
        </div>

        <div className="mt-8">
          <ElephantProfileTabs
            elephant={elephant}
            enrichment={enrichment}
            unnamed={unnamed}
            linkedSanctuaries={linkedSanctuaries}
            father={father}
            mother={mother}
            offspring={offspring}
            herdMates={herdMates}
            photos={photos}
            displayName={displayName}
            activity={activity}
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
