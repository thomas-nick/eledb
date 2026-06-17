import * as cheerio from "cheerio";
import type { SanctuaryImportSource } from "../types";
import {
  ENP_CAMBODIA_LOCATION_ID,
  ENP_HIGHLANDS_LOCATION_ID,
  ENP_LOCATION_ID,
} from "../../../src/data/enpElephantMap";
import {
  discoverLinks,
  extractLabeledField,
  fetchHtml,
  parseStoryAfterHeading,
  parseTitleName,
  photoFromOg,
  normalizeSex,
} from "../utils";

const BASE = "https://www.elephantnaturepark.org";

const FACILITY_BY_NAME: [RegExp, string][] = [
  [/nongpop|kham\s*paeng|mae\s*pon/i, "Elephant Highlands"],
  [/diploh|dipoh|sarai/i, "Cambodia Wildlife Sanctuary"],
  [/kaavan|kavan/i, "Cambodia Wildlife Sanctuary"],
];

function detectFacility(displayName: string, story?: string): string {
  const hay = `${displayName} ${story ?? ""}`;
  for (const [re, facility] of FACILITY_BY_NAME) {
    if (re.test(hay)) return facility;
  }
  if (/cambodia wildlife|mondulkiri/i.test(hay)) return "Cambodia Wildlife Sanctuary";
  if (/elephant highland/i.test(hay)) return "Elephant Highlands";
  return "Elephant Nature Park";
}

function facilityLocationId(facility: string): string {
  if (facility.includes("Highland")) return ENP_HIGHLANDS_LOCATION_ID;
  if (facility.includes("Cambodia")) return ENP_CAMBODIA_LOCATION_ID;
  return ENP_LOCATION_ID;
}

export const enpSource: SanctuaryImportSource = {
  id: "elephant-nature-park",
  label: "Elephant Nature Park",
  locationId: ENP_LOCATION_ID,
  listingUrl: `${BASE}/meet-the-elephants/`,
  photoCredit: "Elephant Nature Park",

  async discoverProfiles() {
    const html = await fetchHtml(`${BASE}/meet-the-elephants/`);
    return discoverLinks(html, BASE, /meet-the-elephants\/([^/?#]+)/i);
  },

  parseProfile(html, profile) {
    const $ = cheerio.load(html);
    const title =
      $("h1").first().text().trim() ||
      $("title").text().replace(/\s*-\s*Elephant Nature Park.*/i, "").trim();
    const { displayName, localName } = parseTitleName(title);
    const { story, teaser } = parseStoryAfterHeading($, /'s story/i);
    const facility = detectFacility(displayName, story);

    return {
      sourceSlug: profile.slug,
      sourceUrl: profile.url,
      displayName,
      localName,
      facility,
      sex: normalizeSex(extractLabeledField($, "Gender")),
      birthDate: extractLabeledField($, "Date Of Birth"),
      rescueDate: extractLabeledField($, "Rescue Date"),
      rescueLocation: extractLabeledField($, "Rescue Location"),
      herdFriends: extractLabeledField($, "Herd / Friends"),
      teaser,
      story,
      photos: photoFromOg($, BASE, "Elephant Nature Park"),
      locationId: facilityLocationId(facility),
    };
  },
};
