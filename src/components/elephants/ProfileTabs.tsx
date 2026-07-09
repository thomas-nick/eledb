"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
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

function tabFromHash(): ProfileTabId | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.replace(/^#/, "");
  if (tabs.some((t) => t.id === hash)) return hash as ProfileTabId;
  return null;
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
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const fromHash = tabFromHash();
    if (fromHash) setActive(fromHash);

    function onHashChange() {
      const next = tabFromHash();
      if (next) setActive(next);
    }
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  function selectTab(id: ProfileTabId) {
    setActive(id);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${id}`);
    }
  }

  const panels: Record<ProfileTabId, React.ReactNode> = {
    overview,
    lineage,
    herd,
    photos,
    activity,
  };

  const focusTab = useCallback((index: number) => {
    tabRefs.current[index]?.focus();
  }, []);

  function onTabKeyDown(e: React.KeyboardEvent, index: number) {
    let next = index;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next = (index + 1) % tabs.length;
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      next = (index - 1 + tabs.length) % tabs.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      next = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      next = tabs.length - 1;
    } else {
      return;
    }
    const tab = tabs[next];
    selectTab(tab.id);
    focusTab(next);
  }

  return (
    <div>
      <div className="border-b border-slate-200 mb-6">
        <div
          role="tablist"
          aria-label="Profile sections"
          className="-mb-px flex gap-1 overflow-x-auto"
        >
          {tabs.map((tab, index) => {
            const tabId = `${baseId}-tab-${tab.id}`;
            const panelId = `${baseId}-panel-${tab.id}`;
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                type="button"
                role="tab"
                id={tabId}
                aria-selected={isActive}
                aria-controls={panelId}
                tabIndex={isActive ? 0 : -1}
                onClick={() => selectTab(tab.id)}
                onKeyDown={(e) => onTabKeyDown(e, index)}
                className={cn(
                  "whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
                  isActive
                    ? "border-forest text-forest"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
      {tabs.map((tab) => {
        const tabId = `${baseId}-tab-${tab.id}`;
        const panelId = `${baseId}-panel-${tab.id}`;
        const isActive = active === tab.id;
        return (
          <div
            key={tab.id}
            role="tabpanel"
            id={panelId}
            aria-labelledby={tabId}
            hidden={!isActive}
            tabIndex={0}
          >
            {isActive ? panels[tab.id] : null}
          </div>
        );
      })}
    </div>
  );
}
