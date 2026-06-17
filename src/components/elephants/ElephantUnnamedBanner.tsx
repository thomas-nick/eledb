import type { ElephantRecord } from "@/types/elephant";
import { Card } from "@/components/ui/Card";

interface ElephantUnnamedBannerProps {
  elephant: ElephantRecord;
}

export function ElephantUnnamedBanner({ elephant }: ElephantUnnamedBannerProps) {
  return (
    <Card className="p-6 md:p-8 mb-10 bg-gradient-to-br from-amber-50 to-clay-light/30 border-amber-200/80">
      <div className="flex flex-col md:flex-row md:items-start gap-5">
        <div className="text-4xl shrink-0" aria-hidden>
          ✨
        </div>
        <div className="flex-1">
          <h2 className="font-serif text-xl md:text-2xl font-bold text-forest mb-2">
            Help name this elephant
          </h2>
          <p className="text-sm md:text-base text-muted leading-relaxed mb-4">
            elephant.se lists this individual at <strong className="text-forest">{elephant.locationName}</strong>{" "}
            without a name or details — a placeholder until someone registers them. We&apos;re building
            a way for mahouts and camps to add photos, local names, and stories. Be among the first.
          </p>
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-forest/10 text-forest text-sm font-medium">
              Mahout contributions — coming soon
            </span>
            <a
              href={elephant.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 rounded-full border border-border text-sm text-muted hover:text-forest hover:border-forest/30 transition-colors"
            >
              View on elephant.se ↗
            </a>
          </div>
        </div>
      </div>
    </Card>
  );
}
