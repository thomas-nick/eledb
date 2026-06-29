import type { ElephantPhoto as ElephantPhotoType, ElephantRecord } from "@/types/elephant";
import { ElephantPhoto } from "@/components/elephants/ElephantPhoto";
import { ContributeButtons } from "@/components/elephants/ContributeButtons";
import { displayElephantName, isUnnamedRecord } from "@/lib/elephantNames";
import {
  categoryLabel,
  subspeciesLabel,
} from "@/lib/elephantDisplay";

interface ProfileHeaderProps {
  elephant: ElephantRecord;
  bannerPhoto?: ElephantPhotoType;
}

export function ProfileHeader({ elephant, bannerPhoto }: ProfileHeaderProps) {
  const unnamed = isUnnamedRecord(elephant);
  const displayName = displayElephantName(elephant);
  const living = elephant.status === "living";
  const sub = elephant.subspecies ?? "unknown";

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${
                living ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${living ? "bg-emerald-500" : "bg-slate-400"}`} />
              {living ? "Living" : "Deceased"}
            </span>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              {subspeciesLabel[sub]}
            </span>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 capitalize">
              {categoryLabel[elephant.category]}
            </span>
          </div>
          <h1
            className={`text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 ${
              unnamed ? "italic text-slate-600" : ""
            }`}
          >
            {displayName}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {elephant.locationName}
            {elephant.country && ` · ${elephant.country}`}
          </p>
        </div>

        <div id="contribute" className="shrink-0">
          <ContributeButtons elephant={elephant} />
        </div>
      </div>

      {bannerPhoto && (
        <div className="relative aspect-[16/5] overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
          <ElephantPhoto
            photo={bannerPhoto}
            alt={displayName}
            className="w-full h-full"
            priority
            sizes="100vw"
          />
        </div>
      )}
    </div>
  );
}
