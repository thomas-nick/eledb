import * as cheerio from "cheerio";
import type { SanctuaryImportSource } from "../types";
import {
  discoverLinks,
  extractColonFields,
  fetchHtml,
  parseStoryAfterHeading,
  parseTitleName,
  photoFromOg,
  normalizeSex,
} from "../utils";

const BASE = "https://www.wildlifesos.org";
const LOCATION_ID = "2627";

export const wildlifeSosSource: SanctuaryImportSource = {
  id: "wildlife-sos",
  label: "Wildlife SOS",
  locationId: LOCATION_ID,
  matchCountry: "India",
  listingUrl: `${BASE}/elephants/`,
  photoCredit: "Wildlife SOS",

  async discoverProfiles() {
    const html = await fetchHtml(`${BASE}/elephants/`);
    return discoverLinks(html, BASE, /\/elephants\/([^/?#]+)\/?$/i).filter(
      (p) => !["elephants", "asian-elephants"].includes(p.slug)
    );
  },

  parseProfile(html, profile) {
    const $ = cheerio.load(html);
    const title = $("h1").first().text().trim();
    const { displayName, localName } = parseTitleName(title, /\s*-\s*Wildlife SOS.*/i);
    const fields = extractColonFields(html);
    const { story, teaser } = parseStoryAfterHeading($, /story/i);

    return {
      sourceSlug: profile.slug,
      sourceUrl: profile.url,
      displayName,
      localName,
      facility: fields.facility ?? "Wildlife SOS",
      sex: normalizeSex(fields.sex),
      birthDate: fields["year of arrival"] ?? fields["age at the time of arrival"],
      rescueDate: fields["year of arrival"],
      rescueLocation: fields.facility,
      teaser: teaser ?? fields.background?.slice(0, 280),
      story: story ?? fields.background,
      photos: photoFromOg($, BASE, "Wildlife SOS"),
    };
  },
};
