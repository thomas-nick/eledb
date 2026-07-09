import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { categoryLabels } from "@/data/articles";
import { experienceTypeLabels } from "@/data/sanctuaries";
import type { Article } from "@/data/articles";
import type { Corridor } from "@/data/corridors";
import type { Hotspot } from "@/data/hotspots";
import type { Sanctuary } from "@/data/sanctuaries";
import { CorridorCard } from "@/components/corridors/CorridorCard";

const techniqueLabels: Record<Hotspot["techniqueType"], string> = {
  "bio-fencing": "Bio-fencing",
  "early-warning": "Early warning",
  community: "Community",
  habitat: "Habitat",
};

export function HotspotCard({ hotspot, accent }: { hotspot: Hotspot; accent: string }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-300 transition-colors">
      <span
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ background: accent }}
        aria-hidden
      />
      <div className="flex items-start justify-between gap-3 mb-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: accent }}>
          {techniqueLabels[hotspot.techniqueType]}
        </p>
        <span className="text-xs text-slate-400 tabular-nums">{hotspot.yearStarted}</span>
      </div>
      <h3 className="font-semibold text-slate-900 text-lg leading-snug">{hotspot.name}</h3>
      <p className="text-sm text-slate-600 mt-2 leading-relaxed line-clamp-3">
        {hotspot.description}
      </p>
      <div className="mt-4 pt-4 border-t border-slate-100">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
          Impact
        </p>
        <p className="text-sm font-medium text-forest">{hotspot.impact}</p>
      </div>
    </div>
  );
}

export function CorridorCardMini({ corridor }: { corridor: Corridor }) {
  return <CorridorCard corridor={corridor} variant="mini" />;
}

export function SanctuaryMiniCard({ sanctuary }: { sanctuary: Sanctuary }) {
  const href = `/sanctuaries?s=${encodeURIComponent(sanctuary.id)}`;
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-xl border border-slate-200 bg-white p-4 hover:border-forest transition-colors"
    >
      <h3 className="font-semibold text-slate-900 group-hover:text-forest transition-colors leading-snug">
        {sanctuary.name}
      </h3>
      <p className="text-sm text-slate-500 mt-1">{sanctuary.region}</p>
      <div className="flex flex-wrap gap-1.5 mt-auto pt-3">
        {sanctuary.experienceTypes.slice(0, 2).map((t) => (
          <Badge key={t} variant="default" className="text-[10px]">
            {experienceTypeLabels[t]}
          </Badge>
        ))}
      </div>
    </Link>
  );
}

export function ArticleMiniCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/resources/${article.slug}`}
      className="group flex gap-4 rounded-xl border border-slate-200 bg-white p-4 hover:border-forest transition-colors"
    >
      <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-slate-100">
        <Image
          src={article.image}
          alt=""
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="96px"
        />
      </div>
      <div className="min-w-0 flex flex-col">
        <Badge variant="info" className="self-start text-[10px] mb-2">
          {categoryLabels[article.category]}
        </Badge>
        <h3 className="font-semibold text-slate-900 group-hover:text-forest transition-colors line-clamp-2 leading-snug">
          {article.title}
        </h3>
        <p className="text-xs text-slate-500 mt-auto pt-2">
          {article.author} · {article.readTime} min
        </p>
      </div>
    </Link>
  );
}
