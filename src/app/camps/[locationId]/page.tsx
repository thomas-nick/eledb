import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ElephantCard } from "@/components/elephants/ElephantCard";
import { ElephantAttribution } from "@/components/elephants/ElephantAttribution";
import { sanctuaries } from "@/data/sanctuaries";
import { getLocation } from "@/lib/locations";
import { searchElephants } from "@/lib/elephants";
import { locationElephantSeUrl } from "@/lib/locationDisplay";
import { experienceTypeLabels } from "@/data/sanctuaries";

interface CampPageProps {
  params: Promise<{ locationId: string }>;
}

export async function generateMetadata({ params }: CampPageProps) {
  const { locationId } = await params;
  const location = await getLocation(locationId);
  if (!location) return { title: "Camp not found" };
  return {
    title: `${location.displayName} — Asian Elephant`,
    description: `${location.elephantCount} Asian elephant records at ${location.name}, ${location.country}.`,
  };
}

export default async function CampPage({ params }: CampPageProps) {
  const { locationId } = await params;
  const location = await getLocation(locationId);
  if (!location) notFound();

  const linkedSanctuaries = sanctuaries.filter((s) => location.sanctuaryIds.includes(s.id));

  const { elephants, total } = await searchElephants({
    locationId,
    status: "living",
    sort: "name",
    perPage: 24,
  });

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
            <span>{location.elephantCount.toLocaleString()} records</span>
            <span>·</span>
            <span>{location.livingCount.toLocaleString()} living</span>
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container size="wide">
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
                    <Link href="/sanctuaries" className="text-clay hover:text-forest font-medium">
                      Full directory →
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h2 className="font-serif text-2xl font-bold text-forest">
              Elephants here
              <span className="text-muted font-normal text-lg ml-2">
                ({total.toLocaleString()} living)
              </span>
            </h2>
            <a
              href={locationElephantSeUrl(locationId)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-clay hover:text-forest font-medium"
            >
              View on elephant.se ↗
            </a>
          </div>

          {elephants.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
