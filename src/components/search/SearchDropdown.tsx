"use client";

import { cn } from "@/lib/utils";
import { Highlight } from "@/components/search/Highlight";

export type SearchDropdownItem = {
  kind: "elephant" | "camp" | "all";
  id: string;
  label: string;
  sub: string;
  href: string;
};

interface SearchDropdownProps {
  items: SearchDropdownItem[];
  active: number;
  query: string;
  loading?: boolean;
  error?: string | null;
  listboxId: string;
  onHover: (index: number) => void;
  onSelect: (item: SearchDropdownItem) => void;
  emptyMessage?: string;
  className?: string;
}

export function SearchDropdown({
  items,
  active,
  query,
  loading,
  error,
  listboxId,
  onHover,
  onSelect,
  emptyMessage,
  className,
}: SearchDropdownProps) {
  if (error) {
    return (
      <div className={cn("px-4 py-3 text-sm text-red-700 bg-red-50", className)} role="alert">
        {error}
      </div>
    );
  }

  if (loading) {
    return (
      <p className={cn("px-4 py-3 text-sm text-slate-400", className)}>
        <span className="sr-only" aria-live="polite">
          Searching…
        </span>
        Searching…
      </p>
    );
  }

  if (items.length === 0 && query.trim()) {
    return (
      <p className={cn("px-4 py-8 text-center text-sm text-slate-400", className)}>
        {emptyMessage ?? `No matches for "${query.trim()}".`}
      </p>
    );
  }

  if (items.length === 0) return null;

  let lastKind: string | null = null;

  return (
    <ul id={listboxId} role="listbox" className={className}>
      {items.map((item, i) => {
        const showHeader = item.kind !== lastKind && item.kind !== "all";
        lastKind = item.kind;
        return (
          <li key={`${item.kind}-${item.id}`}>
            {showHeader && (
              <p className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {item.kind === "elephant" ? "Elephants" : "Camps & facilities"}
              </p>
            )}
            <button
              type="button"
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => onHover(i)}
              onClick={() => onSelect(item)}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
                i === active ? "bg-forest/8" : "hover:bg-slate-50"
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs",
                  item.kind === "all"
                    ? "bg-forest/10 text-forest"
                    : item.kind === "camp"
                      ? "bg-clay/10 text-clay"
                      : "bg-slate-100 text-slate-500"
                )}
                aria-hidden
              >
                {item.kind === "camp" ? "⌂" : item.kind === "all" ? "→" : "🐘"}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-slate-900">
                  {item.kind === "all" ? item.label : <Highlight text={item.label} query={query} />}
                </span>
                {item.sub && (
                  <span className="block truncate text-xs text-slate-400">{item.sub}</span>
                )}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function buildSearchDropdownItems(
  result: {
    elephants: { id: string; name: string; locationName?: string | null; country?: string | null }[];
    camps: { id: string; displayName: string; country: string; elephantCount: number }[];
    elephantTotal: number;
  } | null,
  query: string
): SearchDropdownItem[] {
  if (!result) return [];
  const items: SearchDropdownItem[] = [];
  for (const e of result.elephants) {
    items.push({
      kind: "elephant",
      id: e.id,
      label: e.name,
      sub: [e.locationName, e.country].filter(Boolean).join(" · "),
      href: `/elephants/${e.id}`,
    });
  }
  for (const c of result.camps) {
    items.push({
      kind: "camp",
      id: c.id,
      label: c.displayName,
      sub: `${c.country} · ${c.elephantCount.toLocaleString()} elephants`,
      href: `/camps/${c.id}`,
    });
  }
  if (query.trim()) {
    items.push({
      kind: "all",
      id: "all",
      label: `See all results for "${query.trim()}"`,
      sub: `${result.elephantTotal.toLocaleString()} elephants`,
      href: `/elephants?q=${encodeURIComponent(query.trim())}`,
    });
  }
  return items;
}
