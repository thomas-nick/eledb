"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { track } from "@/lib/analytics";

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    track("search", { source: "home", query: trimmed });
    router.push(trimmed ? `/elephants?q=${encodeURIComponent(trimmed)}` : "/elephants");
  }

  return (
    <div>
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
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, camp, country, or chip ID…"
            aria-label="Search the elephant database"
            className="w-full rounded-lg border border-slate-300 bg-white pl-11 pr-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-forest focus:ring-2 focus:ring-forest/20 shadow-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-forest px-6 py-3 text-sm font-semibold text-white hover:bg-forest-light transition-colors shadow-sm shrink-0"
        >
          Search
        </button>
      </form>

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
