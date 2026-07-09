import Link from "next/link";
import type { ElephantRecord } from "@/types/elephant";
import type { Sanctuary } from "@/data/sanctuaries";
import { categoryLabel, originLabel } from "@/lib/elephantDisplay";
import { Card } from "@/components/ui/Card";

interface ElephantDetailPanelsProps {
  elephant: ElephantRecord;
  linkedSanctuaries: Sanctuary[];
}

export function ElephantDetailPanels({ elephant, linkedSanctuaries }: ElephantDetailPanelsProps) {
  const hasIdentification =
    elephant.chipId ||
    elephant.localId ||
    (elephant.regionalIds && Object.keys(elephant.regionalIds).length > 0);

  const lifeFields = [
    elephant.birthDate && { label: "Born", value: elephant.birthDate },
    elephant.birthPlace && { label: "Birth place", value: elephant.birthPlace },
    elephant.deathDate && { label: "Death", value: elephant.deathDate },
    elephant.deathReason && { label: "Death reason", value: elephant.deathReason },
    elephant.ageYears != null && { label: "Age (est.)", value: `~${elephant.ageYears} years` },
    elephant.origin &&
      elephant.origin !== "unknown" && { label: "Origin", value: originLabel[elephant.origin] },
    elephant.arrivalDate && { label: "Arrived", value: elephant.arrivalDate },
    elephant.management && { label: "Management", value: elephant.management },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
      {hasIdentification && (
        <Card className="p-6">
          <PanelHeading>Identification</PanelHeading>
          <dl className="space-y-3">
            {elephant.chipId && <DetailRow label="Chip ID" value={elephant.chipId} mono />}
            {elephant.localId && <DetailRow label="Local ID" value={elephant.localId} />}
            {elephant.regionalIds &&
              Object.entries(elephant.regionalIds).map(([key, val]) => (
                <DetailRow key={key} label={key} value={val} />
              ))}
          </dl>
        </Card>
      )}

      {lifeFields.length > 0 && (
        <Card className="p-6">
          <PanelHeading>Life history</PanelHeading>
          <dl className="space-y-3">
            {lifeFields.map(({ label, value }) => (
              <DetailRow key={label} label={label} value={value} />
            ))}
          </dl>
        </Card>
      )}

      <Card className="p-6">
        <PanelHeading>At this facility</PanelHeading>
        <p className="font-serif text-2xl font-bold text-forest mb-1">{elephant.locationName}</p>
        <p className="text-sm text-muted mb-4">
          {elephant.country} · {categoryLabel[elephant.category]}
        </p>
        {elephant.locationId && (
          <div className="flex flex-col gap-2">
            <Link
              href={`/camps/${elephant.locationId}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-clay hover:text-forest transition-colors"
            >
              Camp profile →
            </Link>
            <Link
              href={`/elephants?locationId=${elephant.locationId}&locationName=${encodeURIComponent(elephant.locationName)}&status=living`}
              className="inline-flex items-center gap-2 text-sm font-medium text-clay hover:text-forest transition-colors"
            >
              All elephants here →
            </Link>
          </div>
        )}
      </Card>

      {linkedSanctuaries.length > 0 && (
        <Card className="p-6 bg-sage/10 border-sage/25">
          <PanelHeading className="text-sage">In our sanctuary directory</PanelHeading>
          <ul className="space-y-3">
            {linkedSanctuaries.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/sanctuaries?s=${encodeURIComponent(s.id)}`}
                  className="font-serif text-lg font-bold text-forest hover:text-clay transition-colors"
                >
                  {s.name}
                </Link>
                <p className="text-sm text-muted mt-0.5 line-clamp-2">{s.description}</p>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {elephant.transfers && elephant.transfers.length > 0 && (
        <Card className="p-6 lg:col-span-2">
          <PanelHeading>Transfer history</PanelHeading>
          <ol className="relative space-y-0 border-l-2 border-clay/30 ml-2">
            {elephant.transfers.map((t, i) => (
              <li key={i} className="relative pl-6 pb-6 last:pb-0">
                <span className="absolute left-[-5px] top-1.5 w-2 h-2 rounded-full bg-clay" />
                {t.date && (
                  <p className="text-sm font-semibold text-forest">{t.date}</p>
                )}
                {t.toLocation && (
                  <p className="text-sm text-muted mt-0.5">
                    {t.toLocationId ? (
                      <Link
                        href={`/elephants?locationId=${t.toLocationId}`}
                        className="text-clay hover:text-forest font-medium"
                      >
                        {t.toLocation}
                      </Link>
                    ) : (
                      t.toLocation
                    )}
                  </p>
                )}
                {t.fromLocation && (
                  <p className="text-xs text-muted mt-1">from {t.fromLocation}</p>
                )}
              </li>
            ))}
          </ol>
        </Card>
      )}

      {elephant.sources && elephant.sources.length > 0 && (
        <Card className="p-6 lg:col-span-2">
          <PanelHeading>Sources</PanelHeading>
          <ul className="space-y-2 text-sm text-muted">
            {elephant.sources.map((src, i) => (
              <li key={i} className="break-all">
                {src.startsWith("http") ? (
                  <a
                    href={src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-clay hover:text-forest"
                  >
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
    </div>
  );
}

function PanelHeading({
  children,
  className = "text-clay",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={`text-xs font-semibold uppercase tracking-wider mb-4 ${className}`}
    >
      {children}
    </h2>
  );
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <dt className="text-muted shrink-0">{label}</dt>
      <dd className={`text-forest font-medium text-right ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </dd>
    </div>
  );
}
