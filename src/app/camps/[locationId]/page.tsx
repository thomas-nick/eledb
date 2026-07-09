import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ElephantCard } from "@/components/elephants/ElephantCard";
import { ElephantAttribution } from "@/components/elephants/ElephantAttribution";
import { sanctuaries } from "@/data/sanctuaries";
import { getClaimByUserAndLocation, isCampManager } from "@/lib/camp-db";
import { getLocation } from "@/lib/locations";
import { searchElephants } from "@/lib/elephants";
import { getLocationEnrichments } from "@/lib/elephantEnrichments";
import { resolveElephantPhotoUrl } from "@/lib/elephantSe";
import { locationElephantSeUrl } from "@/lib/locationDisplay";
import { experienceTypeLabels } from "@/data/sanctuaries";

const enrichmentSourceLabels: Record<string, string> = {
  "elephant-nature-park": "Elephant Nature Park",
  "wildlife-sos": "Wildlife SOS",
  "phuket-elephant-sanctuary": "Phuket Elephant Sanctuary",
};

interface CampPageProps {
  params: Promise<{ locationId: string }>;
}

export async function generateMetadata({ params }: CampPageProps) {
  const { locationId } = await params;
  const location = await getLocation(locationId);
  if (!location) return { title: "Camp not found" };
  return {
    title: location.displayName,
    description: `${location.elephantCount} Asian elephant records at ${location.name}, ${location.country}.`,
  };
}

export default async function CampPage({ params }: CampPageProps) {
  const { locationId } = await params;
  const location = await getLocation(locationId);
  if (!location) notFound();

  const linkedSanctuaries = sanctuaries.filter((s) => location.sanctuaryIds.includes(s.id));
  const unnamedLiving = location.livingCount - location.namedCount;

  const session = await auth();
  const userId = session?.user?.id;
  const [isManager, existingClaim] = userId
    ? await Promise.all([
        isCampManager(userId, locationId),
        getClaimByUserAndLocation(userId, locationId),
      ])
    : [false, null];
  const hasPendingClaim = existingClaim?.status === "pending";
  const profile = location.profile;

  const [{ elephants, total }, enrichments] = await Promise.all([
    searchElephants({
      locationId,
      status: "living",
      sort: "name",
      perPage: 24,
      namedOnly: true,
    }),
    getLocationEnrichments(locationId),
  ]);

  const stories = enrichments.filter((e) => e.teaser || e.story).slice(0, 6);

  return (
    <>
      <section className="py-12 md:py-16 bg-forest text-ivory">
        <Container>
          <Link href="/camps" className="text-sm text-ivory/70 hover:text-ivory mb-4 inline-block">
            ← All camps
          </Link>
          <div className="flex flex-wrap items-start gap-3 mb-2">
            <h1 className="font-serif text-3xl md:text-4xl font-bold">{location.displayName}</h1>
            <Badge variant="default" className="capitalize mt-2">
              {location.category}
            </Badge>
            {linkedSanctuaries.length > 0 && (
              <Badge variant="success" className="mt-2">
                In sanctuary directory
              </Badge>
            )}
          </div>
          <p className="text-ivory/80 text-lg">{location.country}</p>
          {location.name !== location.displayName && (
            <p className="text-sm text-ivory/60 mt-2">elephant.se: {location.name}</p>
          )}
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-ivory/80">
            <span>{location.namedCount.toLocaleString()} named</span>
            <span>·</span>
            <span>{location.livingCount.toLocaleString()} living</span>
            <span>·</span>
            <span>{location.elephantCount.toLocaleString()} total records</span>
          </div>

          <div className="mt-6">
            {isManager ? (
              <Link
                href={`/manage/camps/${locationId}`}
                className="inline-flex items-center rounded-full bg-ivory px-4 py-2 text-sm font-medium text-forest hover:bg-ivory/90"
              >
                Manage this camp →
              </Link>
            ) : hasPendingClaim ? (
              <span className="inline-flex items-center rounded-full border border-ivory/40 px-4 py-2 text-sm text-ivory/80">
                Claim pending review
              </span>
            ) : (
              <Link
                href={`/claim/${locationId}`}
                className="inline-flex items-center rounded-full border border-ivory/60 px-4 py-2 text-sm font-medium text-ivory hover:bg-ivory hover:text-forest"
              >
                Work here? Claim this listing
              </Link>
            )}
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container size="wide">
          {profile && (profile.description || profile.welfareNotes || profile.website || profile.contactEmail || profile.phone || profile.address) && (
            <Card className="p-6 mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="success">Managed by this camp</Badge>
              </div>
              {profile.description && (
                <p className="text-sm text-muted leading-relaxed whitespace-pre-line">
                  {profile.description}
                </p>
              )}
              {profile.welfareNotes && (
                <div className="mt-4">
                  <h3 className="font-serif text-lg font-bold text-forest mb-1">Welfare practices</h3>
                  <p className="text-sm text-muted leading-relaxed whitespace-pre-line">
                    {profile.welfareNotes}
                  </p>
                </div>
              )}
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-clay hover:text-forest font-medium"
                  >
                    Website →
                  </a>
                )}
                {profile.contactEmail && (
                  <a
                    href={`mailto:${profile.contactEmail}`}
                    className="text-clay hover:text-forest font-medium"
                  >
                    {profile.contactEmail}
                  </a>
                )}
                {profile.phone && <span className="text-muted">{profile.phone}</span>}
                {profile.address && <span className="text-muted">{profile.address}</span>}
              </div>
            </Card>
          )}

          {unnamedLiving > 0 && (
            <Card className="p-5 mb-8 bg-amber-50 border-amber-200">
              <p className="text-sm text-muted leading-relaxed">
                <strong className="text-forest">{unnamedLiving} living elephants</strong> at this
                camp have no name on elephant.se — placeholders only. Showing{" "}
                <strong className="text-forest">{total} named</strong> below.{" "}
                <Link
                  href={`/elephants?locationId=${locationId}&locationName=${encodeURIComponent(location.name)}&status=living&includeUnnamed=true`}
                  className="text-clay hover:text-foreground font-medium"
                >
                  Show all {location.livingCount} including unnamed →
                </Link>
              </p>
            </Card>
          )}

          {linkedSanctuaries.length > 0 && (
            <div className="mb-10 space-y-4">
              <h2 className="font-serif text-2xl font-bold text-forest">Curated sanctuary profile</h2>
              {linkedSanctuaries.map((s) => (
                <Card key={s.id} className="p-6">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {s.experienceTypes.slice(0, 3).map((t) => (
                      <Badge key={t} variant="default" className="text-[10px]">
                        {experienceTypeLabels[t]}
                      </Badge>
                    ))}
                  </div>
                  <h3 className="font-serif text-xl font-bold text-forest mb-1">{s.name}</h3>
                  <p className="text-sm text-muted mb-3">
                    {s.region}, {s.country}
                  </p>
                  <p className="text-sm text-muted leading-relaxed mb-4">{s.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    {s.website && (
                      <a
                        href={s.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-clay hover:text-forest font-medium"
                      >
                        Website →
                      </a>
                    )}
                    <Link
                      href={`/sanctuaries?s=${encodeURIComponent(s.id)}`}
                      className="text-clay hover:text-forest font-medium"
                    >
                      Sanctuary directory entry →
                    </Link>
                    <Link
                      href={`/elephants?locationId=${locationId}&locationName=${encodeURIComponent(location.name)}&status=living`}
                      className="text-clay hover:text-forest font-medium"
                    >
                      All elephants here →
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {stories.length > 0 && (
            <div className="mb-10">
              <h2 className="font-serif text-2xl font-bold text-forest mb-1">
                Sanctuary stories
              </h2>
              <p className="text-sm text-muted mb-5">
                Rescue and care profiles published by sanctuaries connected to this facility.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {stories.map((story) => {
                  const photo = story.photos?.[0];
                  const heading = story.localName ?? story.displayName;
                  return (
                    <Card key={story.id} className="overflow-hidden p-0 flex flex-col">
                      {photo && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={resolveElephantPhotoUrl(photo.url)}
                          alt={heading}
                          className="w-full h-44 object-cover"
                        />
                      )}
                      <div className="p-5 flex-1 flex flex-col">
                        <Badge variant="default" className="self-start text-[10px] mb-2">
                          {enrichmentSourceLabels[story.source] ?? story.source}
                        </Badge>
                        <h3 className="font-serif text-lg font-bold text-forest mb-1">{heading}</h3>
                        {story.rescueLocation && (
                          <p className="text-xs text-muted mb-2">Rescued from {story.rescueLocation}</p>
                        )}
                        {story.teaser && (
                          <p className="text-sm text-muted leading-relaxed mb-4 line-clamp-4">
                            {story.teaser}
                          </p>
                        )}
                        <div className="mt-auto flex flex-wrap gap-4 text-sm">
                          {story.elephantId && (
                            <Link
                              href={`/elephants/${story.elephantId}`}
                              className="text-clay hover:text-forest font-medium"
                            >
                              View record →
                            </Link>
                          )}
                          <a
                            href={story.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-clay hover:text-forest font-medium"
                          >
                            Full story ↗
                          </a>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-clay mb-1">Herd</p>
              <h2 className="font-serif text-2xl font-bold text-forest">
                Elephants at this camp
                <span className="text-muted font-normal text-lg ml-2">
                  ({total.toLocaleString()} living)
                </span>
              </h2>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <Link
                href={`/elephants?locationId=${locationId}&locationName=${encodeURIComponent(location.name)}&status=living`}
                className="text-clay hover:text-forest font-medium"
              >
                Full herd list →
              </Link>
              <a
                href={locationElephantSeUrl(locationId)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-forest font-medium"
              >
                elephant.se ↗
              </a>
            </div>
          </div>

          {elephants.length > 0 ? (
            <>
              <div id="herd" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 scroll-mt-24">
                {elephants.map((elephant) => (
                  <ElephantCard key={elephant.id} elephant={elephant} />
                ))}
              </div>
              {total > elephants.length && (
                <p className="text-center mt-8">
                  <Link
                    href={`/elephants?locationId=${locationId}&locationName=${encodeURIComponent(location.name)}&status=living`}
                    className="text-clay hover:text-forest font-medium"
                  >
                    View all {total.toLocaleString()} elephants at this facility →
                  </Link>
                </p>
              )}
            </>
          ) : (
            <p className="text-muted">No living elephants on record at this location.</p>
          )}

          <div className="mt-12">
            <ElephantAttribution />
          </div>
        </Container>
      </section>
    </>
  );
}
