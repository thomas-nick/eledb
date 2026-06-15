import { elephantSeCountryUrl } from "@/lib/elephantSe";
import { cn } from "@/lib/utils";

export interface CountryChip {
  name: string;
  count: number;
}

interface CountryChipsProps {
  countries: CountryChip[];
  total: number;
  selected: string;
  onSelect: (country: string) => void;
}

export function CountryChips({ countries, total, selected, onSelect }: CountryChipsProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-clay">
        Country
      </p>
      <div className="flex flex-wrap gap-2">
        <FilterChip
          active={selected === "all"}
          onClick={() => onSelect("all")}
        >
          All <span className="opacity-60 tabular-nums">{total}</span>
        </FilterChip>

        {countries.map((country) => (
          <div
            key={country.name}
            className={cn(
              "inline-flex items-stretch rounded-full text-sm font-medium overflow-hidden border transition-colors",
              selected === country.name
                ? "border-forest bg-forest text-ivory"
                : "border-border bg-card text-forest"
            )}
          >
            <button
              type="button"
              onClick={() => onSelect(country.name)}
              className="px-3 py-1.5 hover:opacity-90 transition-opacity"
            >
              {country.name}{" "}
              <span className={selected === country.name ? "opacity-70" : "text-muted"}>
                {country.count}
              </span>
            </button>
            <a
              href={elephantSeCountryUrl(country.name)}
              target="_blank"
              rel="noopener noreferrer"
              title={`Search ${country.name} on elephant.se`}
              className={cn(
                "px-2 flex items-center border-l transition-colors",
                selected === country.name
                  ? "border-ivory/30 hover:bg-ivory/10"
                  : "border-border hover:bg-forest/5"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <span aria-hidden="true">↗</span>
              <span className="sr-only">Search {country.name} on elephant.se</span>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
        active
          ? "border-forest bg-forest text-ivory"
          : "border-border bg-card text-forest hover:border-forest/30"
      )}
    >
      {children}
    </button>
  );
}
