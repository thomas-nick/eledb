import Script from "next/script";

/**
 * Loads a privacy-friendly Plausible analytics script when
 * `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is set. Renders nothing otherwise, so the
 * app ships with no tracking by default.
 *
 * Optional `NEXT_PUBLIC_PLAUSIBLE_SRC` overrides the script source for
 * self-hosted instances (defaults to plausible.io).
 */
export function Analytics() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (!domain) return null;

  const src =
    process.env.NEXT_PUBLIC_PLAUSIBLE_SRC ??
    "https://plausible.io/js/script.js";

  return (
    <Script
      defer
      data-domain={domain}
      src={src}
      strategy="afterInteractive"
    />
  );
}
