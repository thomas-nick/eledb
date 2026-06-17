import * as cheerio from "cheerio";
import type { DiscoveredProfile } from "../types";
import type { SanctuaryImportSource } from "../types";
import { fetchHtml, normalizeSex } from "../utils";

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
    const blocks: string[] = [];
    let rescueDate: string | undefined;
    let deceased = false;

    heading.nextUntil("h3").each((_, el) => {
      const t = $(el).text().trim();
      if (!t) return;
      if (/^RESCUED/i.test(t)) {
        const rescue = t.match(/RESCUED\s+(.+?)(?:\s+PASSED|$)/i);
        rescueDate = rescue?.[1]?.trim();
        if (/PASSED AWAY/i.test(t)) deceased = true;
        return;
      }
      if (/^PASSED AWAY/i.test(t)) {
        deceased = true;
        return;
      }
      if (t.length > 40) blocks.push(t);
    });

    const story = blocks.join("\n\n");
    const teaser = blocks[0]?.slice(0, 280);

    return {
      sourceSlug: profile.slug,
      sourceUrl: profile.url,
      displayName,
      facility: "Phuket Elephant Sanctuary",
      rescueDate,
      teaser,
      story: story || undefined,
      sex: normalizeSex(undefined),
      photos: undefined,
    };
  },
};

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
