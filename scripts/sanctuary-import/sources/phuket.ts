import * as cheerio from "cheerio";
import type { CheerioAPI } from "cheerio";
import type { DiscoveredProfile } from "../types";
import type { SanctuaryImportSource } from "../types";
import type { EnrichmentPhoto } from "../../../src/types/enrichment";
import { absoluteUrl, fetchHtml, normalizeSex } from "../utils";

const BASE = "https://www.phuketelephantsanctuary.org";
const LISTING = `${BASE}/our-elephants/`;
const LOCATION_ID = "2665";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function titleCase(name: string): string {
  return name
    .split(/[\s-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export const phuketSource: SanctuaryImportSource = {
  id: "phuket-elephant-sanctuary",
  label: "Phuket Elephant Sanctuary",
  locationId: LOCATION_ID,
  listingUrl: LISTING,
  photoCredit: "Phuket Elephant Sanctuary",

  async discoverProfiles(): Promise<DiscoveredProfile[]> {
    const html = await fetchHtml(LISTING);
    const $ = cheerio.load(html);
    const profiles: DiscoveredProfile[] = [];
    const seen = new Set<string>();

    $("h3").each((_, el) => {
      const raw = $(el).text().trim();
      if (!raw || /meet our|visit our|in loving memory/i.test(raw)) return;
      const name = titleCase(raw);
      const slug = slugify(raw);
      if (!slug || seen.has(slug)) return;
      seen.add(slug);
      profiles.push({ slug, url: `${LISTING}#${slug}` });
    });

    return profiles;
  },

  parseProfile(html, profile) {
    const $ = cheerio.load(html);
    const heading = $("h3").filter((_, el) => slugify($(el).text()) === profile.slug).first();

    if (!heading.length) {
      throw new Error(`Section not found for ${profile.slug}`);
    }

    const displayName = titleCase(heading.text().trim());
    const content = $(`#${profile.slug}.rich-text, #${profile.slug}`);
    const { blocks, rescueDate } = parsePhuketContent($, content.length ? content : heading);

    const story = blocks.join("\n\n");
    const teaser = blocks[0]?.slice(0, 280);
    const photos = extractPhuketPhoto($, content.length ? content : heading, profile.slug);

    return {
      sourceSlug: profile.slug,
      sourceUrl: profile.url,
      displayName,
      facility: "Phuket Elephant Sanctuary",
      rescueDate,
      teaser,
      story: story || undefined,
      sex: normalizeSex(undefined),
      photos,
    };
  },
};

function parsePhuketContent(
  $: CheerioAPI,
  root: cheerio.Cheerio<cheerio.Element>
): { blocks: string[]; rescueDate?: string } {
  const blocks: string[] = [];
  let rescueDate: string | undefined;

  root.find("p").each((_, el) => {
    const t = $(el).text().replace(/\s+/g, " ").trim();
    if (!t) return;

    const rescueMatch = t.match(/RESCUED\s+(\d{1,2}\s+[A-Za-z]+\s+\d{4})/i);
    if (rescueMatch) {
      rescueDate = rescueDate ?? rescueMatch[1].trim();
      const rest = t
        .replace(/RESCUED\s+\d{1,2}\s+[A-Za-z]+\s+\d{4}/i, "")
        .replace(/PASSED AWAY\s+\d{1,2}\s+[A-Za-z]+\s+\d{4}/gi, "")
        .trim();
      if (rest.length > 40) blocks.push(rest);
      return;
    }
    if (/^PASSED AWAY/i.test(t)) return;
    if (t.length > 40) blocks.push(t);
  });

  return { blocks, rescueDate };
}

function extractPhuketPhoto(
  $: CheerioAPI,
  root: cheerio.Cheerio<cheerio.Element>,
  slug: string
): EnrichmentPhoto[] | undefined {
  const row = root.closest(".multi-col-row, .grid");
  const slugHint = slug.replace(/-/g, "");
  let img = row
    .find("img[data-src], img[src]")
    .filter((_, el) => {
      const title = ($(el).attr("title") ?? $(el).attr("alt") ?? "").toLowerCase();
      return title.includes(slug) || title.replace(/[^a-z]/g, "").includes(slugHint);
    })
    .first();

  if (!img.length) {
    img = row.find("img[data-src], img[src]").first();
  }

  const raw = img.attr("data-src") || img.attr("src");
  if (!raw || raw.startsWith("data:")) return undefined;

  return [
    {
      url: absoluteUrl(BASE, raw.split("?")[0]),
      credit: "Phuket Elephant Sanctuary",
    },
  ];
}

/** Parse all elephants from the single listing page in one fetch */
export async function discoverAndParsePhuketProfiles() {
  const html = await fetchHtml(LISTING);
  const profiles = await phuketSource.discoverProfiles();
  const parsed = [];

  for (const profile of profiles) {
    try {
      parsed.push(phuketSource.parseProfile(html, profile));
    } catch {
      // skip sections that fail parse
    }
  }

  return parsed;
}
