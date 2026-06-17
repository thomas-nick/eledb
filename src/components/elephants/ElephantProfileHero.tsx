import Link from "next/link";
import type { ElephantRecord } from "@/types/elephant";
import { displayElephantName, isUnnamedRecord } from "@/lib/elephantNames";
import {
  categoryLabel,
  sexLabel,
  subspeciesLabel,
  subspeciesScientific,
} from "@/lib/elephantDisplay";
import { Badge } from "@/components/ui/Badge";
import { ElephantPhoto } from "@/components/elephants/ElephantPhoto";

interface ElephantProfileHeroProps {
  elephant: ElephantRecord;
}

export function ElephantProfileHero({ elephant }: ElephantProfileHeroProps) {
  const photo = elephant.photos?.[0];
  const unnamed = isUnnamedRecord(elephant);
  const displayName = displayElephantName(elephant);
  const sub = elephant.subspecies ?? "unknown";

  return (
    <section className="relative min-h-[52vh] md:min-h-[58vh] flex flex-col justify-end overflow-hidden bg-forest text-ivory">
      <div className="absolute inset-0">
        {photo ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.url}
              alt={photo.credit ?? displayName}
              className="w-full h-full object-cover object-[center_30%]"
              sizes="100vw"
              fetchPriority="high"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/75 to-forest/25" />
            <div className="absolute inset-0 bg-gradient-to-r from-forest/90 via-forest/50 to-transparent" />
          </>
        ) : (
          <ElephantPhoto alt={displayName} className="w-full h-full" />
        )}
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pb-8 md:pb-10 pt-24 max-w-6xl mx-auto w-full">
        <Link
          href="/elephants"
          className="text-sm text-ivory/70 hover:text-ivory mb-6 inline-flex items-center gap-1 transition-colors"
        >
          ← Elephant database
        </Link>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Badge
            variant={elephant.status === "living" ? "success" : "danger"}
            className="capitalize"
          >
            {elephant.status}
          </Badge>
          <Badge variant="default" className="bg-ivory/15 text-ivory border-ivory/20 capitalize">
            {categoryLabel[elephant.category]}
          </Badge>
          {elephant.chipId && (
            <Badge variant="default" className="bg-ivory/10 text-ivory/90 border-ivory/15 font-mono text-xs">
              {elephant.chipId}
            </Badge>
          )}
        </div>

        <h1
          className={`font-serif text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05] max-w-3xl ${
            unnamed ? "italic text-ivory/90" : ""
          }`}
        >
          {displayName}
        </h1>

        <p className="mt-3 text-lg md:text-xl text-ivory/85">
          {sexLabel[elephant.sex]}
          {elephant.ageYears != null && ` · ~${elephant.ageYears} years`}
        </p>
        <p className="text-sm md:text-base text-ivory/65 mt-1">
          {subspeciesLabel[sub]} · <span className="italic">{subspeciesScientific[sub]}</span>
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
          {elephant.locationId ? (
            <Link
              href={`/camps/${elephant.locationId}`}
              className="inline-flex items-center gap-2 text-ivory font-medium hover:text-clay-light transition-colors"
            >
              <span className="text-ivory/60 text-sm">At</span>
              <span className="font-serif text-xl md:text-2xl">{elephant.locationName}</span>
              <span className="text-ivory/50">·</span>
              <span className="text-ivory/80">{elephant.country}</span>
            </Link>
          ) : (
            <p className="font-serif text-xl md:text-2xl">
              {elephant.locationName}
              <span className="text-ivory/60 text-base font-sans ml-2">{elephant.country}</span>
            </p>
          )}
        </div>

        {photo?.credit && (
          <p className="mt-4 text-xs text-ivory/50">Photo: {photo.credit}</p>
        )}
      </div>
    </section>
  );
}
