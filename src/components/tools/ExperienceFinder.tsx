"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ExperienceType, experienceTypeLabels } from "@/data/sanctuaryExperience";

interface ExperienceFinderProps {
  onSelect?: (types: ExperienceType[]) => void;
}

const paths: {
  id: string;
  question: string;
  options: { label: string; next: string | ExperienceType[] }[];
}[] = [
  {
    id: "start",
    question: "What kind of elephant experience are you looking for?",
    options: [
      { label: "Walk, feed, and bathe with elephants", next: "hands-on" },
      { label: "Watch from a distance — no touching", next: "observe" },
      { label: "See wild elephants in a national park", next: "wild" },
      { label: "Volunteer for a week or more", next: "volunteer" },
    ],
  },
];

const results: Record<string, { types: ExperienceType[]; title: string; description: string }> = {
  "hands-on": {
    types: ["hands-on", "mahout-culture", "family-run"],
    title: "Hands-On & Mahout Culture",
    description:
      "You want to participate in daily care — feeding, bathing, forest walks. Many Thai and Cambodian camps run on this model. Filter the directory for Hands-On or Mahout Culture tags.",
  },
  observe: {
    types: ["observation-only", "rescue-retirement"],
    title: "Observation & Sanctuary",
    description:
      "You prefer to watch elephants behave naturally without direct contact. Look for Observe Only or Rescue & Retirement tags — and check external WAP/ACES badges if that matters to you.",
  },
  wild: {
    types: ["wild-safari"],
    title: "Wild Elephant Safaris",
    description:
      "The most hands-off option: jeep safaris in national parks where elephants are completely wild. No captive facilities involved.",
  },
  volunteer: {
    types: ["volunteer", "rescue-retirement"],
    title: "Volunteer Programs",
    description:
      "Multi-day stays supporting care, habitat, or conservation work. Elephant Nature Park, Wildlife SOS, and Cambodia Wildlife Sanctuary all offer volunteer programs.",
  },
};

export function ExperienceFinder({ onSelect }: ExperienceFinderProps) {
  const [resultKey, setResultKey] = useState<string | null>(null);

  if (resultKey && results[resultKey]) {
    const result = results[resultKey];
    return (
      <Card>
        <h3 className="font-serif text-xl font-bold text-forest mb-2">{result.title}</h3>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {result.types.map((t) => (
            <span
              key={t}
              className="text-xs px-2.5 py-0.5 rounded-full bg-forest/10 text-forest font-medium"
            >
              {experienceTypeLabels[t]}
            </span>
          ))}
        </div>
        <p className="text-sm text-muted leading-relaxed mb-6">{result.description}</p>
        <div className="flex gap-3">
          <Button onClick={() => setResultKey(null)} variant="outline" size="sm">
            Start Over
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onSelect?.(result.types);
              setResultKey(null);
            }}
          >
            Apply filter
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="font-serif text-xl font-bold text-forest mb-2">
        Find Your Experience
      </h3>
      <p className="text-sm text-muted mb-6">
        No right answer — just what fits your trip. We&apos;ll point you to the right tags in the directory.
      </p>
      <p className="text-base text-forest font-medium mb-4">{paths[0].question}</p>
      <div className="space-y-2">
        {paths[0].options.map((opt) => (
          <button
            key={opt.label}
            onClick={() => typeof opt.next === "string" && setResultKey(opt.next)}
            className="w-full text-left px-4 py-3 rounded-xl border border-border hover:border-clay hover:bg-clay/5 transition-colors text-sm text-forest"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </Card>
  );
}
