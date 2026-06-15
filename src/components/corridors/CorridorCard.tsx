import Image from "next/image";
import { Corridor } from "@/data/corridors";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { calculateProgress } from "@/lib/utils";

interface CorridorCardProps {
  corridor: Corridor;
}

const urgencyVariant: Record<Corridor["urgency"], "danger" | "warning" | "info"> = {
  critical: "danger",
  high: "warning",
  moderate: "info",
};

export function CorridorCard({ corridor }: CorridorCardProps) {
  const hectareProgress = calculateProgress(corridor.hectaresSecured, corridor.hectares);

  return (
    <Card hover className="p-0 overflow-hidden">
      <div className="relative h-48">
        <Image
          src={corridor.image}
          alt={corridor.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute top-4 left-4">
          <Badge variant={urgencyVariant[corridor.urgency]} className="capitalize">
            {corridor.urgency}
          </Badge>
        </div>
      </div>

      <div className="p-6">
        <h3 className="font-serif text-xl font-bold text-forest mb-1">
          {corridor.name}
        </h3>
        <p className="text-sm text-muted mb-3">
          {corridor.countries.join(" / ")} &middot; ~{corridor.elephantPopulation.toLocaleString()} elephants
        </p>

        <p className="text-sm text-muted leading-relaxed mb-4">
          {corridor.description}
        </p>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted">Hectares secured (est.)</span>
            <span className="font-medium text-forest">
              {corridor.hectaresSecured.toLocaleString()} / {corridor.hectares.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-border rounded-full h-2">
            <div
              className="bg-forest h-2 rounded-full"
              style={{ width: `${hectareProgress}%` }}
            />
          </div>
        </div>

        <div className="bg-sage/10 rounded-xl p-4 mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-sage mb-1">
            Genetics
          </p>
          <p className="text-sm text-muted leading-relaxed">{corridor.geneticContext}</p>
        </div>

        <div className="mb-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-clay mb-2">
            Who&apos;s working on it
          </p>
          <div className="flex flex-wrap gap-1.5">
            {corridor.organizations.map((org) => (
              <span
                key={org}
                className="text-xs px-2 py-0.5 rounded-full bg-forest/5 text-forest"
              >
                {org}
              </span>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted border-t border-border pt-3">
          <span className="font-medium text-forest">Status:</span> {corridor.status}
        </p>
      </div>
    </Card>
  );
}
