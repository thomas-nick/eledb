import Link from "next/link";
import { ElephantRecord } from "@/types/elephant";
import { displayElephantName, isUnnamedRecord } from "@/lib/elephantNames";
import { ElephantPhoto } from "@/components/elephants/ElephantPhoto";

const sexLabel = { male: "Male", female: "Female", unknown: "Unknown" };
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
  const unnamed = isUnnamedRecord(elephant);
  const living = elephant.status === "living";
  const photo = elephant.photoUrl ? { url: elephant.photoUrl } : elephant.photos?.[0];

  const meta = [
    sexLabel[elephant.sex] !== "Unknown" ? sexLabel[elephant.sex] : null,
    sub || null,
    elephant.ageYears != null
      ? `${elephant.ageYears} yrs`
      : elephant.birthDate
        ? `b. ${elephant.birthDate}`
        : null,
  ].filter(Boolean);

  return (
    <Link
      href={`/elephants/${elephant.id}`}
      className="group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 rounded-xl"
    >
      <article className="h-full flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors duration-150 group-hover:border-forest">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 shrink-0">
          <ElephantPhoto
            photo={photo}
            alt={displayElephantName(elephant)}
            className="w-full h-full"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {elephant.hasEnrichment && (
            <span className="absolute top-2 left-2 inline-flex items-center rounded-md bg-white/95 px-2 py-0.5 text-[11px] font-medium text-forest ring-1 ring-forest/20 backdrop-blur-sm">
              Story
            </span>
          )}

          <span
            className={`absolute top-2 right-2 inline-flex items-center gap-1 rounded-md bg-white/95 px-2 py-0.5 text-[11px] font-medium backdrop-blur-sm ring-1 ${
              living ? "text-emerald-700 ring-emerald-600/20" : "text-slate-500 ring-slate-400/30"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${living ? "bg-emerald-500" : "bg-slate-400"}`}
            />
            {living ? "Living" : "Deceased"}
          </span>
        </div>

        <div className="flex flex-col flex-1 p-3.5">
          <h3
            className={`text-[15px] font-semibold leading-tight tracking-tight ${
              unnamed ? "text-slate-400 italic" : "text-slate-900 group-hover:text-forest"
            }`}
          >
            {displayElephantName(elephant)}
          </h3>

          <p className="mt-1 text-[13px] text-slate-500">
            {meta.length > 0 ? meta.join(" · ") : unnamed ? "Unnamed record" : "—"}
          </p>

          <div className="mt-2.5 flex items-baseline gap-1.5 text-[13px]">
            <span className="font-medium text-slate-700 truncate">{elephant.locationName}</span>
          </div>
          <p className="text-[12px] text-slate-400">{elephant.country}</p>

          <div className="mt-auto pt-3">
            {elephant.chipId ? (
              <p className="text-[11px] font-mono text-slate-400">{elephant.chipId}</p>
            ) : (elephant.fatherName || elephant.motherName) ? (
              <p className="text-[11px] text-slate-400 truncate border-t border-slate-100 pt-2.5">
                {elephant.fatherName && `Sire ${elephant.fatherName}`}
                {elephant.fatherName && elephant.motherName && " · "}
                {elephant.motherName && `Dam ${elephant.motherName}`}
              </p>
            ) : null}
          </div>
        </div>
      </article>
    </Link>
  );
}
