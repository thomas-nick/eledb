import Link from "next/link";

type SectionIcon =
  | "records"
  | "camps"
  | "sanctuary"
  | "hotspot"
  | "corridor"
  | "article";

const iconPath: Record<SectionIcon, React.ReactNode> = {
  records: (
    <>
      <ellipse cx="12" cy="6" rx="8" ry="3" />
      <path d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6" />
      <path d="M4 12v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
    </>
  ),
  camps: (
    <>
      <path d="M3 21l9-18 9 18M7 21l5-10 5 10" />
    </>
  ),
  sanctuary: (
    <>
      <path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  hotspot: (
    <>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  corridor: (
    <>
      <path d="M4 18l4-8 5 6 7-12" />
      <path d="M14 4h6v6" />
    </>
  ),
  article: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M8 13h8M8 17h5" />
    </>
  ),
};

interface SectionHeaderProps {
  icon: SectionIcon;
  eyebrow: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
  /** Theme tint background color (rgba) */
  tint: string;
  /** Theme border color */
  border: string;
  /** Theme accent (text color for eyebrow + icon stroke) */
  accent: string;
}

export function SectionHeader({
  icon,
  eyebrow,
  title,
  description,
  action,
  tint,
  border,
  accent,
}: SectionHeaderProps) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl mb-6"
      style={{ background: tint, border: `1px solid ${border}` }}
    >
      <DecorativeAccent accent={accent} />
      <div className="relative flex flex-wrap items-start justify-between gap-4 p-5 md:p-6">
        <div className="flex items-start gap-4 min-w-0">
          <span
            className="shrink-0 w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-sm"
            style={{ border: `1px solid ${border}` }}
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: accent === "#a3d3a6" ? "#1a3a2a" : accent }}
            >
              {iconPath[icon]}
            </svg>
          </span>
          <div className="min-w-0">
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.16em]"
              style={{ color: darkenForReadability(accent) }}
            >
              {eyebrow}
            </p>
            <h2 className="font-serif text-xl md:text-2xl font-bold text-slate-900 mt-1 leading-tight">
              {title}
            </h2>
            {description && (
              <p className="text-sm text-slate-600 mt-1.5 max-w-2xl leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>

        {action && (
          <Link
            href={action.href}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-sm font-medium text-slate-900 hover:text-forest shadow-sm transition-colors"
            style={{ border: `1px solid ${border}` }}
          >
            {action.label}
            <span aria-hidden>→</span>
          </Link>
        )}
      </div>
    </div>
  );
}

function DecorativeAccent({ accent }: { accent: string }) {
  return (
    <svg
      className="absolute -right-8 -top-8 w-40 h-40 opacity-[0.15] pointer-events-none"
      viewBox="0 0 100 100"
      aria-hidden
    >
      <circle cx="50" cy="50" r="40" fill="none" stroke={accent} strokeWidth="1" />
      <circle cx="50" cy="50" r="30" fill="none" stroke={accent} strokeWidth="1" />
      <circle cx="50" cy="50" r="20" fill="none" stroke={accent} strokeWidth="1" />
    </svg>
  );
}

/**
 * Light theme accents look washed out as text on light backgrounds.
 * Tilt toward forest/slate for the eyebrow color while keeping accent for icon stroke.
 */
function darkenForReadability(accent: string): string {
  // The accents are intentionally light for use on dark hero gradients.
  // For light surfaces, swap to a deeper, readable forest-leaning tone.
  // Keep this dead simple: map by known palette.
  switch (accent) {
    case "#a3d3a6":
    case "#bcd9c7":
      return "#1a3a2a";
    case "#f3b97a":
    case "#f0b294":
    case "#f5b8a8":
      return "#7a3b1f";
    case "#9ec8ec":
      return "#1c4670";
    default:
      return "#1a3a2a";
  }
}
