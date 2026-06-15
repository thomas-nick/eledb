import Link from "next/link";
import { ElephantRecord } from "@/types/elephant";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

const sexLabel = { male: "♂ Male", female: "♀ Female", unknown: "Unknown" };
const statusVariant = { living: "success" as const, deceased: "danger" as const };
const subspeciesLabel: Record<string, string> = {
  indian: "Indian",
  "sri-lankan": "Sri Lankan",
  sumatran: "Sumatran",
  borneo: "Bornean",
  unknown: "",
};

interface ElephantCardProps {
  elephant: ElephantRecord;
}

export function ElephantCard({ elephant }: ElephantCardProps) {
  const sub = elephant.subspecies ? subspeciesLabel[elephant.subspecies] : "";

  return (
    <Link href={`/elephants/${elephant.id}`}>
      <Card hover className="h-full">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-serif text-lg font-bold text-forest leading-tight">
            {elephant.name}
          </h3>
          <Badge variant={statusVariant[elephant.status]} className="shrink-0 capitalize">
            {elephant.status}
          </Badge>
        </div>

        <p className="text-sm text-muted mb-3">
          {sexLabel[elephant.sex]}
          {sub && ` · ${sub}`}
          {elephant.ageYears != null && ` · ~${elephant.ageYears} yrs`}
          {elephant.birthDate && !elephant.ageYears && ` · born ${elephant.birthDate}`}
        </p>

        <p className="text-sm text-forest font-medium mb-1">{elephant.locationName}</p>
        <p className="text-xs text-muted mb-3">{elephant.country}</p>

        {elephant.chipId && (
          <p className="text-xs text-muted font-mono mb-2">Chip: {elephant.chipId}</p>
        )}

        {(elephant.fatherName || elephant.motherName) && (
          <p className="text-xs text-muted border-t border-border pt-3">
            {elephant.fatherName && <span>Sire: {elephant.fatherName}</span>}
            {elephant.fatherName && elephant.motherName && " · "}
            {elephant.motherName && <span>Dam: {elephant.motherName}</span>}
          </p>
        )}
      </Card>
    </Link>
  );
}
