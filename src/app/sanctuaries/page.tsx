"use client";

import { useState, useMemo } from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SanctuaryCard } from "@/components/sanctuaries/SanctuaryCard";
import { CountryChips } from "@/components/sanctuaries/CountryChips";
import { ExperienceFinder } from "@/components/tools/ExperienceFinder";
import {
  sanctuaries,
  Sanctuary,
  experienceTypeLabels,
} from "@/data/sanctuaries";
import { ExperienceType } from "@/data/sanctuaryExperience";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { dataSources, externalRatingVariants } from "@/data/sanctuarySources";
import Link from "next/link";
import { getLocationIdForSanctuary } from "@/data/elephantSeLocations";
import {
  elephantSeCountryUrl,
  elephantSeDatabaseUrl,
  elephantSeFacilityUrl,
  ELEPHANT_SE_BASE,
} from "@/lib/elephantSe";

const welfareLabels: { key: keyof Sanctuary["welfare"]; label: string }[] = [
  { key: "noRiding", label: "No Riding" },
  { key: "noChaining", label: "No Chaining" },
  { key: "naturalForaging", label: "Natural Foraging" },
  { key: "handsOffObservation", label: "Hands-Off Observation" },
  { key: "veterinaryCare", label: "Veterinary Care" },
  { key: "spaciousEnclosure", label: "Spacious Enclosure" },
];

export default function SanctuariesPage() {
  const [search, setSearch] = useState("");
  const [experienceFilter, setExperienceFilter] = useState<ExperienceType | "all">("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Sanctuary | null>(null);

  const countries = useMemo(
    () => [...new Set(sanctuaries.map((s) => s.country))].sort(),
    []
  );

  const countryChips = useMemo(
    () =>
      countries.map((name) => ({
        name,
        count: sanctuaries.filter((s) => s.country === name).length,
      })),
    [countries]
  );

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return sanctuaries.filter((s) => {
      const matchesSearch =
        !query ||
        s.name.toLowerCase().includes(query) ||
        s.country.toLowerCase().includes(query) ||
        s.region.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query);
      const matchesExperience =
        experienceFilter === "all" || s.experienceTypes.includes(experienceFilter);
      const matchesCountry = countryFilter === "all" || s.country === countryFilter;
      const matchesSource =
        sourceFilter === "all" ||
        s.externalRatings?.some((r) => r.sourceId === sourceFilter);
      return matchesSearch && matchesExperience && matchesCountry && matchesSource;
    });
  }, [search, experienceFilter, countryFilter, sourceFilter]);

  return (
    <>
      <section className="py-16 md:py-24 bg-forest text-ivory">
        <Container>
          <SectionHeading
            eyebrow="Directory"
            title="Elephant Camps & Sanctuaries"
            description={`${sanctuaries.length} places across ${countries.length} countries — a curated directory for planning your trip. We don't tell you what's right; we help you find what fits, with welfare tags and external assessments if you want them.`}
          />
        </Container>
      </section>

      <section className="py-8 bg-sage/10 border-b border-border">
        <Container>
          <p className="text-sm text-muted leading-relaxed max-w-3xl">
            In Thailand, elephants are revered — sacred in royal tradition, woven into Buddhist culture, and cared for by mahout families who often know one animal for decades. 
            This directory honors that context. Welfare criteria from groups like WAP and ACES are included as <em>reference tags</em>, not verdicts. 
            Many camps operate on thin margins; feeding and bathing tourists join is often how elephants get fed.
          </p>
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container size="wide">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <CountryChips
                countries={countryChips}
                total={sanctuaries.length}
                selected={countryFilter}
                onSelect={setCountryFilter}
              />

              {countryFilter !== "all" && (
                <p className="text-sm text-muted">
                  Individual elephant records for{" "}
                  <a
                    href={elephantSeCountryUrl(countryFilter)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-clay hover:text-forest font-medium transition-colors"
                  >
                    {countryFilter} on elephant.se ↗
                  </a>
                  {" "}— births, transfers, named animals at camps and temples.
                </p>
              )}

              <div className="flex flex-col sm:flex-row flex-wrap gap-4">
                <input
                  type="search"
                  placeholder="Search by name, region, country..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 min-w-[200px] px-4 py-3 rounded-xl border border-border bg-card text-forest placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-forest/20"
                />
                <select
                  value={experienceFilter}
                  onChange={(e) => setExperienceFilter(e.target.value as ExperienceType | "all")}
                  className="px-4 py-3 rounded-xl border border-border bg-card text-forest focus:outline-none focus:ring-2 focus:ring-forest/20"
                >
                  <option value="all">All Experiences</option>
                  {Object.entries(experienceTypeLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-border bg-card text-forest focus:outline-none focus:ring-2 focus:ring-forest/20"
                >
                  <option value="all">External assessments</option>
                  {dataSources.map((s) => (
                    <option key={s.id} value={s.id}>{s.shortName}</option>
                  ))}
                </select>
              </div>

              <p className="text-sm text-muted">
                {filtered.length} {filtered.length === 1 ? "place" : "places"}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filtered.map((sanctuary) => (
                  <SanctuaryCard
                    key={sanctuary.id}
                    sanctuary={sanctuary}
                    onSelect={setSelected}
                  />
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-12 text-muted">
                  No places match your filters. Try broadening your search.
                </div>
              )}
            </div>

            <div className="space-y-6">
              <ExperienceFinder />

              {selected && (
                <Card>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {selected.experienceTypes.map((t) => (
                          <Badge key={t} variant="default" className="text-[10px]">
                            {experienceTypeLabels[t]}
                          </Badge>
                        ))}
                      </div>
                      <h3 className="font-serif text-xl font-bold text-forest">
                        {selected.name}
                      </h3>
                      <p className="text-sm text-muted">{selected.region}, {selected.country}</p>
                    </div>
                    <button
                      onClick={() => setSelected(null)}
                      className="text-muted hover:text-forest"
                      aria-label="Close details"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <p className="text-sm text-muted leading-relaxed mb-4">
                    {selected.description}
                  </p>

                  {selected.externalRatings && selected.externalRatings.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-clay mb-2">
                        External Assessments
                      </p>
                      <div className="space-y-2">
                        {selected.externalRatings.map((rating) => (
                          <div key={`${rating.sourceId}-${rating.type}`} className="flex items-start gap-2">
                            <Badge variant={externalRatingVariants[rating.type]} className="shrink-0">
                              {rating.label}
                            </Badge>
                            {rating.note && (
                              <span className="text-xs text-muted">{rating.note}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selected.website && (
                    <a
                      href={selected.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-clay hover:text-forest transition-colors mb-2 inline-block mr-4"
                    >
                      Visit website &rarr;
                    </a>
                  )}

                  <a
                    href={elephantSeFacilityUrl(selected)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-clay hover:text-forest transition-colors mb-2 inline-block mr-4"
                  >
                    Search on elephant.se &rarr;
                  </a>

                  {getLocationIdForSanctuary(selected.id) && (
                    <Link
                      href={`/elephants?locationId=${getLocationIdForSanctuary(selected.id)}&locationName=${encodeURIComponent(selected.name)}`}
                      className="text-sm text-clay hover:text-forest transition-colors mb-4 inline-block"
                    >
                      Named elephants at this camp &rarr;
                    </Link>
                  )}

                  {!getLocationIdForSanctuary(selected.id) && (
                    <Link
                      href={`/elephants?q=${encodeURIComponent(selected.name)}&country=${encodeURIComponent(selected.country)}`}
                      className="text-sm text-clay hover:text-forest transition-colors mb-4 inline-block"
                    >
                      Search elephants here &rarr;
                    </Link>
                  )}

                  {selected.contextNotes && selected.contextNotes.length > 0 && (
                    <div className="mb-4 pt-4 border-t border-border">
                      <p className="text-xs font-semibold uppercase tracking-wider text-sage mb-2">
                        Local Context
                      </p>
                      <ul className="space-y-2">
                        {selected.contextNotes.map((note) => (
                          <li key={note} className="text-sm text-muted flex items-start gap-2">
                            <span className="text-sage mt-0.5">·</span> {note}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selected.externalConcerns.length > 0 && (
                    <div className="mb-4 pt-4 border-t border-border">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                        What some welfare groups note
                      </p>
                      <ul className="space-y-1">
                        {selected.externalConcerns.map((note) => (
                          <li key={note} className="text-sm text-muted flex items-start gap-2">
                            <span className="text-muted/60 mt-0.5">—</span> {note}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="space-y-3 pt-4 border-t border-border">
                    <p className="text-xs font-semibold uppercase tracking-wider text-clay">
                      Welfare Reference (NGO criteria)
                    </p>
                    {welfareLabels.map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between text-sm">
                        <span className="text-muted">{label}</span>
                        <span className={selected.welfare[key] ? "text-green-700" : "text-stone-400"}>
                          {selected.welfare[key] ? "Yes" : "No"}
                        </span>
                      </div>
                    ))}
                  </div>

                  {selected.highlights.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-xs font-semibold uppercase tracking-wider text-sage mb-2">
                        Highlights
                      </p>
                      <ul className="space-y-1">
                        {selected.highlights.map((h) => (
                          <li key={h} className="text-sm text-muted flex items-start gap-2">
                            <span className="text-sage mt-0.5">+</span> {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              )}
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 bg-forest/5 border-t border-border">
        <Container>
          <h3 className="font-serif text-2xl font-bold text-forest mb-2">
            Individual Elephant Records
          </h3>
          <p className="text-muted mb-6 max-w-2xl leading-relaxed">
            Our directory covers where to visit. For named elephants — births, transfers, parentage,
            death records —{" "}
            <a
              href={ELEPHANT_SE_BASE}
              target="_blank"
              rel="noopener noreferrer"
              className="text-clay hover:text-forest font-medium transition-colors"
            >
              elephant.se
            </a>{" "}
            is the deepest public index, run since 1995. Use country chips above to filter here,
            then ↗ to browse the same country on elephant.se.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={elephantSeDatabaseUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-clay hover:text-forest transition-colors"
            >
              Global Elephant Database ↗
            </a>
            <span className="text-muted">·</span>
            {countryChips.map((c) => (
              <a
                key={c.name}
                href={elephantSeCountryUrl(c.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted hover:text-forest transition-colors"
              >
                {c.name} ↗
              </a>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 bg-sage/10 border-t border-border">
        <Container>
          <h3 className="font-serif text-2xl font-bold text-forest mb-2">
            External Welfare Assessments
          </h3>
          <p className="text-muted mb-8 max-w-2xl">
            These independent frameworks are useful if hands-off tourism matters to you. 
            They are one perspective — not the only one. Policies change; verify with the camp directly.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dataSources.map((source) => (
              <Card key={source.id}>
                <h4 className="font-semibold text-forest mb-1">{source.name}</h4>
                <p className="text-xs text-muted mb-3">Synced: {source.lastSynced}</p>
                <p className="text-sm text-muted leading-relaxed mb-4">{source.description}</p>
                <Link
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-clay hover:text-forest transition-colors"
                >
                  View source &rarr;
                </Link>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
