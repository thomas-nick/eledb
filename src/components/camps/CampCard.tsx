import Link from "next/link";
import type { LocationSummary } from "@/types/location";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface CampCardProps {
  location: LocationSummary;
}

export function CampCard({ location }: CampCardProps) {
  return (
    <Link href={`/camps/${location.id}`}>
      <Card hover className="h-full">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-serif text-lg font-bold text-forest leading-snug">
            {location.displayName}
          </h3>
          {location.sanctuaryIds.length > 0 && (
            <Badge variant="success" className="text-[10px] shrink-0">
              Curated
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted mb-3">{location.country}</p>
        <div className="flex flex-wrap gap-2 text-xs text-muted">
          <span>{location.livingCount} living</span>
          <span>·</span>
          <span>{location.elephantCount} total</span>
          <span>·</span>
          <span className="capitalize">{location.category}</span>
        </div>
      </Card>
    </Link>
  );
}
