import Link from "next/link";
import type { ElephantRecord } from "@/types/elephant";
import {
  categoryLabel,
  originLabel,
  sexLabel,
  subspeciesLabel,
} from "@/lib/elephantDisplay";

interface ProfileMetadataStripProps {
  elephant: ElephantRecord;
}

export function ProfileMetadataStrip({ elephant }: ProfileMetadataStripProps) {
  const sub = elephant.subspecies ?? "unknown";
  const items = [
    { label: "Sex", value: sexLabel[elephant.sex] },
    elephant.ageYears != null
      ? { label: "Age", value: `~${elephant.ageYears} yrs` }
      : elephant.birthDate
        ? { label: "Born", value: elephant.birthDate }
        : null,
    elephant.origin && elephant.origin !== "unknown"
      ? { label: "Origin", value: originLabel[elephant.origin] }
      : null,
    { label: "Subspecies", value: subspeciesLabel[sub] },
    { label: "Facility", value: categoryLabel[elephant.category] },
    elephant.chipId ? { label: "Chip", value: elephant.chipId, mono: true } : null,
    {
      label: "Location",
      value: elephant.locationName,
      href: elephant.locationId ? `/camps/${elephant.locationId}` : undefined,
    },
    { label: "Country", value: elephant.country },
    {
      label: "Updated",
      value: new Date(elephant.syncedAt).toLocaleDateString(),
    },
  ].filter(Boolean) as {
    label: string;
    value: string;
    mono?: boolean;
    href?: string;
  }[];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-px rounded-lg border border-slate-200 bg-slate-200 overflow-hidden">
      {items.map((item) => (
        <div key={item.label} className="bg-white px-3 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
            {item.label}
          </p>
          {item.href ? (
            <Link
              href={item.href}
              className={`text-sm font-medium text-forest hover:underline line-clamp-2 ${
                item.mono ? "font-mono text-xs" : ""
              }`}
            >
              {item.value}
            </Link>
          ) : (
            <p
              className={`text-sm font-medium text-slate-900 line-clamp-2 ${
                item.mono ? "font-mono text-xs" : ""
              }`}
            >
              {item.value}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
