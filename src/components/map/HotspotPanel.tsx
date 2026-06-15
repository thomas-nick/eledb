"use client";

import { Hotspot } from "@/data/hotspots";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

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
      <div className="bg-card rounded-2xl border border-border p-8 text-center">
        <div className="text-sage mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 className="font-serif text-xl font-bold text-forest mb-2">
          Select a Hotspot
        </h3>
        <p className="text-muted text-sm">
          Click any orange marker on the map to explore a coexistence success story.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
      <div className="flex items-start justify-between mb-4">
        <div>
          <Badge variant={techniqueVariants[hotspot.techniqueType]} className="mb-3">
            {techniqueLabels[hotspot.techniqueType]}
          </Badge>
          <h3 className="font-serif text-2xl font-bold text-forest">
            {hotspot.name}
          </h3>
          <p className="text-sm text-muted mt-1">{hotspot.country}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-muted hover:text-forest transition-colors"
          aria-label="Close panel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-clay mb-1">
            Technique
          </p>
          <p className="text-forest font-medium">{hotspot.technique}</p>
        </div>

        <p className="text-muted leading-relaxed">{hotspot.description}</p>

        <div className="bg-sage/10 rounded-xl p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-sage mb-1">
            Impact
          </p>
          <p className="text-forest font-medium">{hotspot.impact}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <p className="text-2xl font-serif font-bold text-forest">
              {hotspot.yearStarted}
            </p>
            <p className="text-xs text-muted">Year Started</p>
          </div>
          <div>
            <p className="text-2xl font-serif font-bold text-forest">
              {hotspot.communitySize.toLocaleString()}
            </p>
            <p className="text-xs text-muted">People Served</p>
          </div>
        </div>
      </div>

      <Button href="/donate" variant="secondary" className="w-full mt-6">
        Fund This Approach
      </Button>
    </div>
  );
}
