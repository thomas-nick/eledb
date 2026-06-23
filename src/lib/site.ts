/** Canonical public origin, used for metadata, sitemap, and robots. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.AUTH_URL ??
  "https://mahoot.xyz"
).replace(/\/$/, "");

export const SITE_NAME = "mahoot";

export const LOGO_SRC = "/logo.png";

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
