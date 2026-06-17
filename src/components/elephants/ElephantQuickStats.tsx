import type { ElephantRecord } from "@/types/elephant";
import { isUnnamedRecord } from "@/lib/elephantNames";
import {
  categoryLabel,
  originLabel,
  sexLabel,
  subspeciesLabel,
} from "@/lib/elephantDisplay";
import { Card } from "@/components/ui/Card";

interface ElephantQuickStatsProps {
  elephant: ElephantRecord;
  offspringCount: number;
  herdMateCount: number;
  namedHerdMateCount: number;
}

interface StatItem {
  label: string;
  value: string;
}

export function ElephantQuickStats({
  elephant,
  offspringCount,
  herdMateCount,
  namedHerdMateCount,
}: ElephantQuickStatsProps) {
  const sub = elephant.subspecies ?? "unknown";
  const items: StatItem[] = [];

  if (elephant.ageYears != null) {
    items.push({ label: "Age", value: `~${elephant.ageYears} yrs` });
  } else if (elephant.birthDate) {
    items.push({ label: "Born", value: elephant.birthDate });
  }

  items.push({ label: "Sex", value: sexLabel[elephant.sex] });
  items.push({
    label: "Status",
    value: elephant.status === "living" ? "Living" : "Deceased",
  });

  if (elephant.origin && elephant.origin !== "unknown") {
    items.push({ label: "Origin", value: originLabel[elephant.origin] });
  }

  items.push({ label: "Subspecies", value: subspeciesLabel[sub] });
  items.push({ label: "Facility", value: categoryLabel[elephant.category] });
  items.push({ label: "Country", value: elephant.country });

  if (elephant.chipId) {
    items.push({ label: "Chip ID", value: elephant.chipId });
  }

  if (offspringCount > 0) {
    items.push({
      label: "Offspring",
      value: String(offspringCount),
    });
  }

  if (herdMateCount > 0) {
    const herdValue =
      namedHerdMateCount < herdMateCount
        ? `${namedHerdMateCount} named`
        : String(herdMateCount);
    items.push({ label: "Herd-mates", value: herdValue });
  }

  const photoCount = elephant.photos?.length ?? 0;
  if (photoCount > 0) {
    items.push({ label: "Photos", value: String(photoCount) });
  }

  if (isUnnamedRecord(elephant)) {
    items.push({ label: "Record", value: "Unnamed" });
  }

  return (
    <Card className="shadow-lg border-border/80 overflow-hidden">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 divide-x divide-y divide-border">
        {items.map((item) => (
          <div key={item.label} className="px-4 py-4 md:py-5 text-center md:text-left">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-clay mb-1">
              {item.label}
            </p>
            <p
              className={`font-serif text-base md:text-lg font-bold text-forest leading-tight ${
                item.label === "Chip ID" ? "font-mono text-sm md:text-base" : ""
              }`}
            >
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
