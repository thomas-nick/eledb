import Link from "next/link";
import type { ElephantEnrichment } from "@/types/enrichment";
import {
  enrichmentSourceHostname,
  enrichmentSourceLabel,
} from "@/lib/enrichmentDisplay";
import { Card } from "@/components/ui/Card";

interface ElephantEnrichmentStoryProps {
  enrichment: ElephantEnrichment;
}

export function ElephantEnrichmentStory({ enrichment }: ElephantEnrichmentStoryProps) {
  const paragraphs = enrichment.story?.split(/\n\n+/).filter(Boolean) ?? [];
  const showTeaserOnly = paragraphs.length === 0 && enrichment.teaser;

  return (
    <section className="mb-12">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-clay mb-2">
            Sanctuary story
          </p>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-forest">
            {enrichment.localName
              ? `${enrichment.displayName} (${enrichment.localName})`
              : enrichment.displayName}
          </h2>
          {enrichment.facility && (
            <p className="text-sm text-muted mt-1">{enrichment.facility}</p>
          )}
        </div>
        <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-sage/15 text-forest text-xs font-semibold border border-sage/25">
          {enrichmentSourceLabel(enrichment.source)}
        </span>
      </div>

      <Card className="p-6 md:p-8">
        {showTeaserOnly && (
          <p className="text-base md:text-lg text-foreground leading-relaxed">
            {enrichment.teaser}
          </p>
        )}

        {paragraphs.length > 0 && (
          <div className="space-y-4 text-base text-muted leading-relaxed">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        )}

        {(enrichment.rescueDate || enrichment.rescueLocation || enrichment.herdFriends) && (
          <dl className="mt-6 pt-6 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            {enrichment.birthDate && (
              <div>
                <dt className="text-clay font-semibold uppercase tracking-wider text-[10px] mb-1">
                  Born
                </dt>
                <dd className="text-forest font-medium">{enrichment.birthDate}</dd>
              </div>
            )}
            {enrichment.rescueDate && enrichment.rescueDate !== "-" && (
              <div>
                <dt className="text-clay font-semibold uppercase tracking-wider text-[10px] mb-1">
                  Rescue
                </dt>
                <dd className="text-forest font-medium">{enrichment.rescueDate}</dd>
              </div>
            )}
            {enrichment.herdFriends && (
              <div>
                <dt className="text-clay font-semibold uppercase tracking-wider text-[10px] mb-1">
                  Herd / friends
                </dt>
                <dd className="text-forest font-medium">{enrichment.herdFriends}</dd>
              </div>
            )}
          </dl>
        )}

        <p className="mt-6 text-xs text-muted">
          Story from{" "}
          <Link
            href={enrichment.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-clay hover:text-forest font-medium"
          >
            {enrichmentSourceHostname(enrichment.sourceUrl)} ↗
          </Link>
          . elephant.se data synced separately; this narrative is not overwritten by weekly sync.
        </p>
      </Card>
    </section>
  );
}
