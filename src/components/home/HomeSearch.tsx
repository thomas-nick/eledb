"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { track } from "@/lib/analytics";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";
import {
  SearchDropdown,
  buildSearchDropdownItems,
  type SearchDropdownItem,
} from "@/components/search/SearchDropdown";

const quickCountries = [
  { label: "Thailand", country: "Thailand" },
  { label: "India", country: "India" },
  { label: "Sri Lanka", country: "Sri Lanka" },
  { label: "Cambodia", country: "Cambodia" },
  { label: "Indonesia", country: "Indonesia" },
];

export function HomeSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const { result, loading, error } = useGlobalSearch(query, { limit: 5, minLength: 2 });
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = "home-search-listbox";

  const items = buildSearchDropdownItems(result, query);
  const hasResults = items.length > 0;
  const showDropdown =
    query.trim().length >= 2 && (loading || hasResults || Boolean(error));

  const go = useCallback(
    (item: SearchDropdownItem) => {
      track("search_select", { source: "home", kind: item.kind });
      setOpen(false);
      router.push(item.href);
    },
    [router]
  );

  function submit(target?: string) {
    const trimmed = query.trim();
    track("search", { source: "home", query: trimmed });
    setOpen(false);
    router.push(target ?? (trimmed ? `/elephants?q=${encodeURIComponent(trimmed)}` : "/elephants"));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const item = items[active];
    if (open && item) go(item);
    else submit();
  }

  useEffect(() => {
    if (hasResults || loading || error) setOpen(true);
  }, [hasResults, loading, error]);

  useEffect(() => {
    setActive(0);
  }, [result]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function onInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, Math.max(items.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={inputRef}
            id="home-search-input"
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value.trim().length >= 2) setOpen(true);
            }}
            onFocus={() => hasResults && setOpen(true)}
            onKeyDown={onInputKeyDown}
            placeholder="Search by name, camp, country, or chip ID…"
            aria-label="Search the elephant database"
            aria-expanded={open && hasResults}
            aria-controls={listboxId}
            aria-activedescendant={items[active] ? `${listboxId}-option-${active}` : undefined}
            autoComplete="off"
            className="w-full rounded-lg border border-slate-300 bg-white pl-11 pr-10 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-forest focus:ring-2 focus:ring-forest/20 shadow-sm"
          />
          {loading && (
            <>
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-forest" aria-hidden />
              <span className="sr-only" aria-live="polite">
                Searching…
              </span>
            </>
          )}
        </div>
        <button
          type="submit"
          className="rounded-lg bg-forest px-6 py-3 text-sm font-semibold text-white hover:bg-forest-light transition-colors shadow-sm shrink-0"
        >
          Search
        </button>
      </form>

      {showDropdown && (
        <div className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-lg border border-slate-200 bg-white text-left shadow-xl sm:right-[7.5rem]">
          <div className="max-h-[22rem] overflow-y-auto py-1.5">
            <SearchDropdown
              items={items}
              active={active}
              query={query}
              loading={loading}
              error={error}
              listboxId={listboxId}
              onHover={setActive}
              onSelect={go}
            />
          </div>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        <span className="text-slate-500">Popular:</span>
        {quickCountries.map((c) => (
          <Link
            key={c.country}
            href={`/elephants?country=${encodeURIComponent(c.country)}`}
            className="font-medium text-clay hover:text-forest transition-colors"
          >
            {c.label}
          </Link>
        ))}
        <span className="text-slate-300 hidden sm:inline">·</span>
        <Link href="/countries" className="font-medium text-forest hover:underline">
          All countries
        </Link>
      </div>
    </div>
  );
}
