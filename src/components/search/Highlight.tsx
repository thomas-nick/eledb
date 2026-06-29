import { Fragment } from "react";

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Highlights occurrences of `query` tokens within `text`. Splits the query on
 * whitespace so multi-word searches highlight each term.
 */
export function Highlight({ text, query }: { text: string; query: string }) {
  const terms = query
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 1)
    .map(escapeRegExp);

  if (terms.length === 0) return <>{text}</>;

  const splitRegex = new RegExp(`(${terms.join("|")})`, "ig");
  const testRegex = new RegExp(`^(?:${terms.join("|")})$`, "i");
  const parts = text.split(splitRegex);

  return (
    <>
      {parts.map((part, i) =>
        testRegex.test(part) ? (
          <mark key={i} className="bg-clay/15 text-inherit font-semibold rounded-[2px] px-0.5">
            {part}
          </mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        )
      )}
    </>
  );
}
