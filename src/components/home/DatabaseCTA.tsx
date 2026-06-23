"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { track } from "@/lib/analytics";

const quickCountries = [
  { label: "Thailand", country: "Thailand" },
  { label: "India", country: "India" },
  { label: "Sri Lanka", country: "Sri Lanka" },
  { label: "Cambodia", country: "Cambodia" },
  { label: "Indonesia", country: "Indonesia" },
];

export function DatabaseCTA() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    track("search", { source: "home", query: trimmed });
    router.push(trimmed ? `/elephants?q=${encodeURIComponent(trimmed)}` : "/elephants");
  }

  return (
    <section className="py-20 bg-ivory border-y border-border">
      <Container>
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-clay mb-3">
            The Database
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-forest">
            Search 14,000+ named elephants
          </h2>
          <p className="mt-4 text-muted leading-relaxed">
            Individual records from elephant.se — names, camps, parentage, and chip IDs
            across 13 range countries and zoos worldwide.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-3">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, camp, or country…"
              aria-label="Search the elephant database"
              className="flex-1 rounded-lg border border-border bg-white px-4 py-3 text-sm focus:border-forest focus:ring-1 focus:ring-forest"
            />
            <button
              type="submit"
              className="rounded-lg bg-forest px-6 py-3 text-sm font-medium text-ivory hover:bg-forest-light transition-colors"
            >
              Search
            </button>
          </form>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <span className="text-sm text-muted">Browse:</span>
            {quickCountries.map((c) => (
              <Link
                key={c.country}
                href={`/elephants?country=${encodeURIComponent(c.country)}`}
                className="text-sm font-medium text-clay hover:text-forest transition-colors"
              >
                {c.label}
              </Link>
            ))}
            <Link
              href="/countries"
              className="text-sm font-medium text-forest hover:underline"
            >
              All countries →
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
