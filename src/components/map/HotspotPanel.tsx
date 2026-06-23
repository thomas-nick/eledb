"use client";

import Link from "next/link";
import { Hotspot } from "@/data/hotspots";
import { articles } from "@/data/articles";
import { getCountrySlugFromDbName } from "@/data/countryMeta";
import { Badge } from "@/components/ui/Badge";

interface HotspotPanelProps {
  hotspot: Hotspot | null;
  onClose: () => void;
}

const techniqueLabels: Record<Hotspot["techniqueType"], string> = {
  "bio-fencing": "Bio-Fencing",
  "early-warning": "Early Warning",
  community: "Community",
  habitat: "Habitat",
};

const techniqueVariants: Record<Hotspot["techniqueType"], "success" | "info" | "warning" | "default"> = {
  "bio-fencing": "success",
  "early-warning": "info",
  community: "warning",
  habitat: "default",
};

export function HotspotPanel({ hotspot, onClose }: HotspotPanelProps) {
  if (!hotspot) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center h-full min-h-[280px] flex flex-col items-center justify-center">
        <div className="text-slate-300 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Select a hotspot</h3>
        <p className="text-slate-500 text-sm">
          Click an orange marker on the map to explore a coexistence story from the field.
        </p>
      </div>
    );
  }

  const countrySlug = getCountrySlugFromDbName(hotspot.country);
  const relatedArticle = hotspot.relatedArticleSlug
    ? articles.find((a) => a.slug === hotspot.relatedArticleSlug)
    : undefined;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <Badge variant={techniqueVariants[hotspot.techniqueType]} className="mb-3">
            {techniqueLabels[hotspot.techniqueType]}
          </Badge>
          <h3 className="text-xl font-semibold text-slate-900">{hotspot.name}</h3>
          <p className="text-sm text-slate-500 mt-1">{hotspot.country}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
          aria-label="Close panel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Technique
          </p>
          <p className="text-slate-900 font-medium">{hotspot.technique}</p>
        </div>

        <p className="text-slate-600 text-sm leading-relaxed">{hotspot.description}</p>

        <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
          <p className="text-xs font-semibold uppercase tracking-wider text-forest mb-1">Impact</p>
          <p className="text-slate-900 font-medium text-sm">{hotspot.impact}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-1">
          <div>
            <p className="text-xl font-semibold text-slate-900">{hotspot.yearStarted}</p>
            <p className="text-xs text-slate-500">Year started</p>
          </div>
          <div>
            <p className="text-xl font-semibold text-slate-900">
              {hotspot.communitySize.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500">People served</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-6">
        {countrySlug ? (
          <Link
            href={`/countries/${countrySlug}`}
            className="inline-flex justify-center rounded-lg bg-forest px-4 py-2.5 text-sm font-medium text-white hover:bg-forest-light"
          >
            {hotspot.country} country hub
          </Link>
        ) : (
          <Link
            href={`/elephants?country=${encodeURIComponent(hotspot.country)}`}
            className="inline-flex justify-center rounded-lg bg-forest px-4 py-2.5 text-sm font-medium text-white hover:bg-forest-light"
          >
            Elephants in {hotspot.country}
          </Link>
        )}
        <Link
          href={`/camps?country=${encodeURIComponent(hotspot.country)}`}
          className="inline-flex justify-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-forest hover:text-forest"
        >
          Camps in {hotspot.country}
        </Link>
      </div>

      {relatedArticle && (
        <div className="mt-4 rounded-lg border border-clay/30 bg-clay-light/20 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-clay mb-1">
            Read the field note
          </p>
          <Link
            href={`/resources/${relatedArticle.slug}`}
            className="text-sm font-medium text-forest hover:underline"
          >
            {relatedArticle.title} →
          </Link>
        </div>
      )}
    </div>
  );
}
