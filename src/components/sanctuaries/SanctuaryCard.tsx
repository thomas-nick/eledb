import {
  Sanctuary,
  experienceTypeLabels,
  experienceTypeVariants,
} from "@/data/sanctuaries";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { externalRatingVariants } from "@/data/sanctuarySources";
import { getLocationIdForSanctuary } from "@/data/elephantSeLocations";
import { elephantSeFacilityUrl } from "@/lib/elephantSe";
import Link from "next/link";

interface SanctuaryCardProps {
  sanctuary: Sanctuary;
  elephantCount?: number;
  selected?: boolean;
  onSelect?: (sanctuary: Sanctuary) => void;
}

const welfareLabels: { key: keyof Sanctuary["welfare"]; label: string }[] = [
  { key: "noRiding", label: "No Riding" },
  { key: "noChaining", label: "No Chaining" },
  { key: "naturalForaging", label: "Foraging" },
  { key: "handsOffObservation", label: "Hands-Off" },
  { key: "veterinaryCare", label: "Vet Care" },
  { key: "spaciousEnclosure", label: "Spacious" },
];

function primaryHref(sanctuary: Sanctuary, locationId?: string): string {
  if (locationId) return `/camps/${locationId}`;
  return `/elephants?q=${encodeURIComponent(sanctuary.name)}&country=${encodeURIComponent(sanctuary.country)}`;
}

export function SanctuaryCard({
  sanctuary,
  elephantCount,
  selected,
  onSelect,
}: SanctuaryCardProps) {
  const elephantSeUrl = elephantSeFacilityUrl(sanctuary);
  const locationId = getLocationIdForSanctuary(sanctuary.id);
  const elephantsHref = primaryHref(sanctuary, locationId);

  return (
    <Card
      hover
      className={
        selected
          ? "cursor-pointer ring-2 ring-forest/40 border-forest/30"
          : "cursor-pointer"
      }
      onClick={() => onSelect?.(sanctuary)}
    >
      <div className="mb-3">
        <h3 className="font-serif text-xl font-bold text-forest">{sanctuary.name}</h3>
        <p className="text-sm text-muted">
          {sanctuary.region}, {sanctuary.country}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {sanctuary.experienceTypes.map((type) => (
          <Badge key={type} variant={experienceTypeVariants[type]} className="text-[10px]">
            {experienceTypeLabels[type]}
          </Badge>
        ))}
      </div>

      <p className="text-sm text-muted leading-relaxed line-clamp-2 mb-3">
        {sanctuary.description}
      </p>

      {sanctuary.externalRatings && sanctuary.externalRatings.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {sanctuary.externalRatings.slice(0, 2).map((rating) => (
            <Badge
              key={`${rating.sourceId}-${rating.type}`}
              variant={externalRatingVariants[rating.type]}
              className="text-[10px]"
            >
              {rating.label}
            </Badge>
          ))}
          {sanctuary.externalRatings.length > 2 && (
            <Badge variant="default" className="text-[10px]">
              +{sanctuary.externalRatings.length - 2}
            </Badge>
          )}
        </div>
      )}

      <details className="group" onClick={(e) => e.stopPropagation()}>
        <summary className="text-xs text-muted cursor-pointer hover:text-forest list-none flex items-center gap-1">
          <span className="group-open:rotate-90 transition-transform inline-block">›</span>
          Welfare reference (Western NGO criteria)
        </summary>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {welfareLabels.map(({ key, label }) => (
            <span
              key={key}
              className={`text-xs px-2 py-0.5 rounded-full ${
                sanctuary.welfare[key]
                  ? "bg-green-50 text-green-800"
                  : "bg-stone-100 text-stone-500"
              }`}
            >
              {label}
            </span>
          ))}
        </div>
      </details>

      <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-border text-xs text-muted flex-wrap">
        <div className="flex items-center gap-3">
          <span>Capacity: {sanctuary.visitorCapacity}</span>
          <span>&middot;</span>
          <span>Price: {sanctuary.priceRange}</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={elephantsHref}
            onClick={(e) => e.stopPropagation()}
            className="text-clay hover:text-forest font-medium whitespace-nowrap transition-colors"
          >
            {elephantCount != null && elephantCount > 0
              ? `${elephantCount.toLocaleString()} elephants →`
              : locationId
                ? "Named elephants →"
                : "Search elephants →"}
          </Link>
          <a
            href={elephantSeUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-muted hover:text-forest font-medium whitespace-nowrap transition-colors"
          >
            elephant.se ↗
          </a>
        </div>
      </div>
    </Card>
  );
}
