import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ElephantAttribution } from "@/components/elephants/ElephantAttribution";
import { displayElephantName, isUnnamedRecord } from "@/lib/elephantNames";
import { getElephantById, getHerdMates, getOffspring } from "@/lib/elephants";
import { getSanctuaryIdsForLocation } from "@/data/elephantSeLocations";
import { sanctuaries } from "@/data/sanctuaries";

interface PageProps {
  params: Promise<{ id: string }>;
}

const sexLabel = { male: "♂ Male", female: "♀ Female", unknown: "Sex unknown" };
const subspeciesLabel: Record<string, string> = {
  indian: "Indian elephant (E. m. indicus)",
  "sri-lankan": "Sri Lankan elephant (E. m. maximus)",
  sumatran: "Sumatran elephant (E. m. sumatrensis)",
  borneo: "Bornean elephant (E. m. borneensis)",
  unknown: "Asian elephant (Elephas maximus)",
};
const originLabel = {
  "wild-caught": "Wild-caught",
  "captive-born": "Captive-born",
  unknown: "Unknown origin",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const elephant = await getElephantById(id);
  if (!elephant) return { title: "Elephant not found" };
  const title = displayElephantName(elephant);
  return {
    title: `${title} — ${elephant.locationName}`,
    description: `Asian elephant record for ${title} at ${elephant.locationName}, ${elephant.country}.`,
  };
}

export default async function ElephantDetailPage({ params }: PageProps) {
  const { id } = await params;
  const elephant = await getElephantById(id);
  if (!elephant) notFound();

  const [offspring, herdMates] = await Promise.all([
    getOffspring(id),
    elephant.locationId ? getHerdMates(elephant.locationId, id) : Promise.resolve([]),
  ]);

  const linkedSanctuaryIds = elephant.locationId
    ? getSanctuaryIdsForLocation(elephant.locationId)
    : [];
  const linkedSanctuaries = sanctuaries.filter((s) => linkedSanctuaryIds.includes(s.id));

  const photo = elephant.photos?.[0];
  const unnamed = isUnnamedRecord(elephant);
  const hasIdentification =
    elephant.chipId ||
    elephant.localId ||
    (elephant.regionalIds && Object.keys(elephant.regionalIds).length > 0);

  return (
    <>
      <section className="py-12 md:py-16 bg-forest text-ivory">
        <Container>
          <Link href="/elephants" className="text-sm text-ivory/70 hover:text-ivory mb-4 inline-block">
            ← Back to database
          </Link>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-2">
              <div className="flex flex-wrap items-start gap-3 mb-2">
                <h1 className="font-serif text-3xl md:text-4xl font-bold">
                  {displayElephantName(elephant)}
                </h1>
                <Badge
                  variant={elephant.status === "living" ? "success" : "danger"}
                  className="capitalize mt-2"
                >
                  {elephant.status}
                </Badge>
              </div>
              <p className="text-ivory/80 text-lg mb-1">
                {sexLabel[elephant.sex]}
                {elephant.ageYears != null && ` · ~${elephant.ageYears} years old`}
              </p>
              <p className="text-ivory/70">
                {subspeciesLabel[elephant.subspecies ?? "unknown"]}
              </p>
              <p className="text-ivory/80 mt-3 font-medium">
                {elephant.locationName}, {elephant.country}
              </p>
            </div>
            {photo && (
              <figure className="rounded-2xl overflow-hidden bg-ivory/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={photo.credit ?? elephant.name}
                  className="w-full h-48 object-cover"
                />
                {photo.credit && (
                  <figcaption className="text-xs text-ivory/60 p-2">{photo.credit}</figcaption>
                )}
              </figure>
            )}
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container size="narrow">
          {unnamed && (
            <Card className="p-5 mb-8 bg-amber-50 border-amber-200">
              <h2 className="font-serif text-lg font-bold text-forest mb-2">
                No individual profile yet
              </h2>
              <p className="text-sm text-muted leading-relaxed mb-3">
                elephant.se lists this elephant at {elephant.locationName} without a name or
                details — a common placeholder for camps that haven&apos;t registered individuals
                yet. Mahout and camp contributions coming soon to help fill these in.
              </p>
              <p className="text-xs text-muted">
                Know this elephant?{" "}
                <a href={elephant.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-clay hover:text-forest">
                  View on elephant.se ↗
                </a>
              </p>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {hasIdentification && (
              <Card className="p-5">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-clay mb-3">
                  Identification
                </h2>
                <dl className="space-y-2 text-sm">
                  {elephant.chipId && (
                    <DetailRow label="Chip ID" value={elephant.chipId} mono />
                  )}
                  {elephant.localId && (
                    <DetailRow label="Local ID" value={elephant.localId} />
                  )}
                  {elephant.regionalIds &&
                    Object.entries(elephant.regionalIds).map(([key, val]) => (
                      <DetailRow key={key} label={key} value={val} />
                    ))}
                </dl>
              </Card>
            )}

            <Card className="p-5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-clay mb-3">Life</h2>
              <dl className="space-y-2 text-sm">
                {elephant.birthDate && (
                  <DetailRow label="Born" value={elephant.birthDate} />
                )}
                {elephant.birthPlace && (
                  <DetailRow label="Birth place" value={elephant.birthPlace} />
                )}
                {elephant.deathDate && (
                  <DetailRow label="Death" value={elephant.deathDate} />
                )}
                {elephant.deathReason && (
                  <DetailRow label="Death reason" value={elephant.deathReason} />
                )}
                {elephant.ageYears != null && (
                  <DetailRow label="Age (est.)" value={`~${elephant.ageYears} years`} />
                )}
                {elephant.origin && elephant.origin !== "unknown" && (
                  <DetailRow label="Origin" value={originLabel[elephant.origin]} />
                )}
                {elephant.arrivalDate && (
                  <DetailRow label="Arrived" value={elephant.arrivalDate} />
                )}
                {elephant.management && (
                  <DetailRow label="Management" value={elephant.management} />
                )}
              </dl>
            </Card>

            <Card className="p-5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-clay mb-3">
                Lineage
              </h2>
              <dl className="space-y-2 text-sm">
                <DetailRow
                  label="Sire"
                  value={
                    elephant.fatherId ? (
                      <Link href={`/elephants/${elephant.fatherId}`} className="text-clay hover:text-forest">
                        {elephant.fatherName ?? elephant.fatherId}
                      </Link>
                    ) : (
                      elephant.fatherName ?? "—"
                    )
                  }
                />
                <DetailRow
                  label="Dam"
                  value={
                    elephant.motherId ? (
                      <Link href={`/elephants/${elephant.motherId}`} className="text-clay hover:text-forest">
                        {elephant.motherName ?? elephant.motherId}
                      </Link>
                    ) : (
                      elephant.motherName ?? "—"
                    )
                  }
                />
              </dl>
              {offspring.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs font-semibold uppercase tracking-wider text-clay mb-2">
                    Offspring ({offspring.length})
                  </p>
                  <ul className="space-y-1">
                    {offspring.map((child) => (
                      <li key={child.id}>
                        <Link
                          href={`/elephants/${child.id}`}
                          className="text-sm text-forest hover:text-clay"
                        >
                          {child.sex === "male" ? "♂" : child.sex === "female" ? "♀" : "?"}{" "}
                          {child.name}
                          {child.birthDate && ` · ${child.birthDate}`}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>

            <Card className="p-5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-clay mb-3">
                Location
              </h2>
              <p className="font-serif text-xl font-bold text-forest mb-1">{elephant.locationName}</p>
              <p className="text-sm text-muted mb-4">
                {elephant.country} · {elephant.category}
              </p>
              {elephant.locationId && (
                <>
                  <Link
                    href={`/camps/${elephant.locationId}`}
                    className="text-sm text-clay hover:text-forest font-medium block mb-2"
                  >
                    Camp profile →
                  </Link>
                  <Link
                    href={`/elephants?locationId=${elephant.locationId}&locationName=${encodeURIComponent(elephant.locationName)}`}
                    className="text-sm text-clay hover:text-forest font-medium"
                  >
                    All elephants at this facility →
                  </Link>
                </>
              )}
            </Card>
          </div>

          {herdMates.length > 0 && (
            <Card className="p-5 mb-8">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-clay mb-3">
                Herd-mates at {elephant.locationName}
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {herdMates.map((mate) => (
                  <li key={mate.id}>
                    <Link
                      href={`/elephants/${mate.id}`}
                      className="text-sm text-forest hover:text-clay"
                    >
                      {mate.sex === "male" ? "♂" : mate.sex === "female" ? "♀" : "?"}{" "}
                      {mate.name}
                      {mate.birthDate && ` · ${mate.birthDate}`}
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {elephant.transfers && elephant.transfers.length > 0 && (
            <Card className="p-5 mb-8">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-clay mb-4">
                Transfer history
              </h2>
              <ol className="space-y-3 border-l-2 border-border pl-4">
                {elephant.transfers.map((t, i) => (
                  <li key={i} className="text-sm">
                    {t.date && (
                      <span className="font-medium text-forest">{t.date}</span>
                    )}
                    {t.toLocation && (
                      <span className="text-muted">
                        {t.date ? " — " : ""}
                        {t.toLocationId ? (
                          <Link
                            href={`/elephants?locationId=${t.toLocationId}`}
                            className="text-clay hover:text-forest"
                          >
                            {t.toLocation}
                          </Link>
                        ) : (
                          t.toLocation
                        )}
                      </span>
                    )}
                    {t.fromLocation && (
                      <span className="text-muted text-xs block">
                        from {t.fromLocation}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </Card>
          )}

          {linkedSanctuaries.length > 0 && (
            <Card className="p-5 mb-8 bg-sage/10 border-sage/20">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-sage mb-3">
                In our sanctuary directory
              </h2>
              <ul className="space-y-2">
                {linkedSanctuaries.map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`/camps/${elephant.locationId}`}
                      className="text-sm font-medium text-forest hover:text-clay"
                    >
                      {s.name} →
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {elephant.sources && elephant.sources.length > 0 && (
            <Card className="p-5 mb-8">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-clay mb-3">
                Sources
              </h2>
              <ul className="space-y-2 text-sm text-muted list-disc pl-4">
                {elephant.sources.map((src, i) => (
                  <li key={i} className="break-all">
                    {src.startsWith("http") ? (
                      <a href={src} target="_blank" rel="noopener noreferrer" className="text-clay hover:text-forest">
                        {src}
                      </a>
                    ) : (
                      src
                    )}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <div className="flex flex-wrap gap-4 mb-8">
            <a
              href={elephant.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-clay hover:text-forest"
            >
              Original record on elephant.se ↗
            </a>
          </div>

          <ElephantAttribution compact />
        </Container>
      </section>
    </>
  );
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted shrink-0">{label}</dt>
      <dd className={`text-forest font-medium text-right ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </dd>
    </div>
  );
}
