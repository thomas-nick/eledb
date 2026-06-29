"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function CampsSearchBar({
  initialQuery,
  initialSort,
}: {
  initialQuery: string;
  initialSort: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (!value) params.delete(key);
        else params.set(key, value);
      }
      params.delete("limit");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  useEffect(() => {
    const urlQ = searchParams.get("q") ?? "";
    if (query.trim() === urlQ) return;
    const timer = setTimeout(() => {
      updateParams({ q: query.trim() || null });
    }, 300);
    return () => clearTimeout(timer);
  }, [query, searchParams, updateParams]);

  return (
    <div className="flex flex-col sm:flex-row gap-2.5">
      <div className="relative flex-1">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          id="camps-search-input"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search camps by name or region…"
          aria-label="Search camps"
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-forest focus:ring-1 focus:ring-forest"
        />
      </div>
      <select
        value={initialSort}
        aria-label="Sort camps by"
        onChange={() => {
          /* sort wired when backend supports it */
        }}
        className="px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm shrink-0 focus:outline-none focus:border-forest focus:ring-1 focus:ring-forest"
      >
        <option value="name">Name A–Z</option>
      </select>
    </div>
  );
}
