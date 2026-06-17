import Link from "next/link";
import type { ElephantRecord } from "@/types/elephant";
import { displayElephantName, isUnnamedRecord } from "@/lib/elephantNames";
import { sexShort } from "@/lib/elephantDisplay";
import { ElephantPhoto } from "@/components/elephants/ElephantPhoto";

interface ElephantProfileMateCardProps {
  elephant: ElephantRecord;
  role?: string;
  highlight?: boolean;
}

export function ElephantProfileMateCard({
  elephant,
  role,
  highlight,
}: ElephantProfileMateCardProps) {
  const unnamed = isUnnamedRecord(elephant);
  const name = displayElephantName(elephant);

  const inner = (
    <div
      className={`group rounded-2xl overflow-hidden border transition-all h-full ${
        highlight
          ? "border-clay bg-clay/5 shadow-md ring-2 ring-clay/30"
          : "border-border bg-card hover:border-clay/40 hover:shadow-sm"
      }`}
    >
      <div className="aspect-[4/3] relative overflow-hidden bg-forest/5">
        <ElephantPhoto
          photo={elephant.photos?.[0]}
          alt={name}
          className="w-full h-full [&_img]:transition-transform [&_img]:group-hover:scale-105"
        />
        <span className="absolute top-2 left-2 text-lg bg-forest/70 text-ivory rounded-full w-8 h-8 flex items-center justify-center backdrop-blur-sm">
          {sexShort[elephant.sex]}
        </span>
      </div>
      <div className="p-3">
        {role && (
          <p className="text-[10px] font-semibold uppercase tracking-wider text-clay mb-1">
            {role}
          </p>
        )}
        <p
          className={`font-serif font-bold leading-tight line-clamp-2 ${
            unnamed ? "text-muted italic text-sm" : "text-forest"
          }`}
        >
          {name}
        </p>
        <p className="text-xs text-muted mt-1">
          {elephant.birthDate && `born ${elephant.birthDate}`}
          {elephant.birthDate && elephant.ageYears != null && " · "}
          {elephant.ageYears != null && `~${elephant.ageYears} yrs`}
        </p>
      </div>
    </div>
  );

  if (highlight) return inner;

  return (
    <Link href={`/elephants/${elephant.id}`} className="block h-full">
      {inner}
    </Link>
  );
}
