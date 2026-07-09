import Link from "next/link";
import type { ElephantRecord } from "@/types/elephant";
import { isUnnamedRecord } from "@/lib/elephantNames";
import { ElephantProfileMateCard } from "@/components/elephants/ElephantProfileMateCard";

interface ElephantHerdSectionProps {
  elephant: ElephantRecord;
  herdMates: ElephantRecord[];
}

const DISPLAY_LIMIT = 12;

export function ElephantHerdSection({ elephant, herdMates }: ElephantHerdSectionProps) {
  if (herdMates.length === 0) return null;

  const namedMates = herdMates.filter((m) => !isUnnamedRecord(m));
  const displayMates = namedMates.slice(0, DISPLAY_LIMIT);
  const unnamedCount = herdMates.length - namedMates.length;

  return (
    <section className="mb-12">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-clay mb-2">Herd</p>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-forest">
            Living at {elephant.locationName}
          </h2>
          <p className="text-sm text-muted mt-1">
            {namedMates.length} named
            {unnamedCount > 0 && ` · ${unnamedCount} unnamed`}
            {" "}herd-mate{herdMates.length !== 1 ? "s" : ""}
          </p>
        </div>
        {elephant.locationId && (
          <Link
            href={`/camps/${elephant.locationId}#herd`}
            className="text-sm font-medium text-clay hover:text-forest transition-colors whitespace-nowrap"
          >
            Camp herd page →
          </Link>
        )}
      </div>

      {displayMates.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayMates.map((mate) => (
            <ElephantProfileMateCard key={mate.id} elephant={mate} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">
          All herd-mates at this camp are unnamed placeholders on elephant.se.
        </p>
      )}

      {namedMates.length > DISPLAY_LIMIT && elephant.locationId && (
        <p className="mt-4 text-sm text-muted">
          Showing {DISPLAY_LIMIT} of {namedMates.length}.{" "}
          <Link
            href={`/camps/${elephant.locationId}#herd`}
            className="text-clay hover:text-forest font-medium"
          >
            See full herd →
          </Link>
        </p>
      )}
    </section>
  );
}
