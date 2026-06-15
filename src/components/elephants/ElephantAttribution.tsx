import Link from "next/link";
import { ELEPHANT_SE_BASE } from "@/lib/elephantSe";

export function ElephantAttribution({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="text-xs text-muted">
        Data from{" "}
        <a
          href={ELEPHANT_SE_BASE}
          target="_blank"
          rel="noopener noreferrer"
          className="text-clay hover:text-forest"
        >
          elephant.se
        </a>{" "}
        (Dan A. J. Koehl),{" "}
        <a
          href="https://creativecommons.org/licenses/by/4.0/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-clay hover:text-forest"
        >
          CC BY 4.0
        </a>
        . Reformatted for search.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-forest/5 p-5 text-sm text-muted leading-relaxed">
      <p className="font-medium text-forest mb-1">Data source</p>
      <p>
        Individual elephant records are synced from{" "}
        <a
          href={ELEPHANT_SE_BASE}
          target="_blank"
          rel="noopener noreferrer"
          className="text-clay hover:text-forest font-medium"
        >
          elephant.se
        </a>{" "}
        by Dan A. J. Koehl, used under{" "}
        <a
          href="https://creativecommons.org/licenses/by/4.0/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-clay hover:text-forest font-medium"
        >
          Creative Commons Attribution 4.0
        </a>
        . We reformatted the data for search and filtering; the original records remain authoritative.
      </p>
      <p className="mt-2">
        Records synced weekly into MySQL on{" "}
        <Link href="https://mahoot.xyz" className="text-clay hover:text-forest font-medium">
          mahoot.xyz
        </Link>
        .
      </p>
    </div>
  );
}
