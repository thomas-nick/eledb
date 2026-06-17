import type { ElephantEnrichment } from "../../src/types/enrichment";
import type { EnrichmentPhoto } from "../../src/types/enrichment";
import * as cheerio from "cheerio";

export const IMPORT_DELAY_MS = 800;

export function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "asianelephant-import/1.0 (conservation catalog)" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

export function absoluteUrl(base: string, href: string): string {
  if (href.startsWith("http")) return href;
  return `${base.replace(/\/$/, "")}${href.startsWith("/") ? "" : "/"}${href}`;
}

export function normalizeSex(value?: string): ElephantEnrichment["sex"] {
  const v = value?.toLowerCase() ?? "";
  if (v.includes("male") && !v.includes("female")) return "male";
  if (v.includes("female")) return "female";
  return "unknown";
}

export function parseTitleName(title: string, siteSuffix?: RegExp): {
  displayName: string;
  localName?: string;
} {
  const cleaned = siteSuffix ? title.replace(siteSuffix, "").trim() : title.trim();
  const localMatch = cleaned.match(/\(([^)]+)\)/);
  const displayName = cleaned.replace(/\s*\([^)]+\)\s*/, "").trim();
  return {
    displayName: displayName || cleaned,
    localName: localMatch?.[1]?.trim(),
  };
}

export function extractOgImage($: cheerio.CheerioAPI, baseUrl: string): string | undefined {
  const og =
    $('meta[property="og:image"]').attr("content") ||
    $("article img, .entry-content img, main img").first().attr("src");
  if (!og) return undefined;
  return absoluteUrl(baseUrl, og);
}

export function photoFromOg(
  $: cheerio.CheerioAPI,
  baseUrl: string,
  credit: string
): EnrichmentPhoto[] | undefined {
  const url = extractOgImage($, baseUrl);
  return url ? [{ url, credit }] : undefined;
}

/** ENP-style h6 label fields */
export function extractLabeledField($: cheerio.CheerioAPI, label: string): string | undefined {
  let found: string | undefined;
  $("h6, h5, h4, strong, b").each((_, el) => {
    const text = $(el).text().trim();
    if (text.toLowerCase() === label.toLowerCase()) {
      const next = $(el).parent().next().text().trim() || $(el).next().text().trim();
      if (next && next !== text) found = next.replace(/^[-–—]\s*/, "");
    }
  });
  return found || undefined;
}

/** "Label: value" lines in body text */
export function extractColonFields(html: string): Record<string, string> {
  const fields: Record<string, string> = {};
  const $ = cheerio.load(html);
  const text = $("main, article, .entry-content, body").first().text();
  for (const line of text.split("\n")) {
    const m = line.match(/^([^:]{3,40}):\s*(.+)$/);
    if (m) fields[m[1].trim().toLowerCase()] = m[2].trim();
  }
  return fields;
}

export function parseStoryAfterHeading(
  $: cheerio.CheerioAPI,
  headingPattern: RegExp
): { story?: string; teaser?: string } {
  const heading = $("h2, h3, h4")
    .filter((_, el) => headingPattern.test($(el).text()))
    .first();

  const blocks: string[] = [];
  if (heading.length) {
    heading.nextUntil("h2, h3").each((_, el) => {
      const t = $(el).text().trim();
      if (t && t.length > 30 && !/^donate/i.test(t) && !t.startsWith("Back to")) {
        blocks.push(t);
      }
    });
  }

  const story = blocks.join("\n\n") || undefined;
  return { story, teaser: blocks[0]?.slice(0, 280) };
}

export function discoverLinks(
  html: string,
  baseUrl: string,
  pathPattern: RegExp
): { slug: string; url: string }[] {
  const $ = cheerio.load(html);
  const seen = new Set<string>();
  const profiles: { slug: string; url: string }[] = [];

  $("a[href]").each((_, a) => {
    const href = $(a).attr("href") ?? "";
    const match = href.match(pathPattern);
    if (!match) return;
    const slug = decodeURIComponent(match[1]);
    if (seen.has(slug)) return;
    seen.add(slug);
    const url = absoluteUrl(baseUrl, href).split("?")[0].replace(/\/$/, "") + "/";
    profiles.push({ slug, url });
  });

  return profiles;
}
