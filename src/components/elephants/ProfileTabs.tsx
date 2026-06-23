"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "lineage", label: "Lineage" },
  { id: "herd", label: "Herd" },
  { id: "photos", label: "Photos" },
  { id: "activity", label: "Activity" },
] as const;

export type ProfileTabId = (typeof tabs)[number]["id"];

interface ProfileTabsProps {
  overview: React.ReactNode;
  lineage: React.ReactNode;
  herd: React.ReactNode;
  photos: React.ReactNode;
  activity: React.ReactNode;
  defaultTab?: ProfileTabId;
}

export function ProfileTabs({
  overview,
  lineage,
  herd,
  photos,
  activity,
  defaultTab = "overview",
}: ProfileTabsProps) {
  const [active, setActive] = useState<ProfileTabId>(defaultTab);

  const panels: Record<ProfileTabId, React.ReactNode> = {
    overview,
    lineage,
    herd,
    photos,
    activity,
  };

  return (
    <div>
      <div className="border-b border-slate-200 mb-6">
        <nav className="-mb-px flex gap-1 overflow-x-auto" aria-label="Profile sections">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              className={cn(
                "whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
                active === tab.id
                  ? "border-forest text-forest"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              )}
              aria-current={active === tab.id ? "page" : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div>{panels[active]}</div>
    </div>
  );
}
