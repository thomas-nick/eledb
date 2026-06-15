import * as cheerio from "cheerio";
import type { ElephantOrigin, ElephantSubspecies } from "../../src/types/elephant";
import {
  cleanDate,
  elephantPageUrl,
  normalizeCategory,
  parseAgeYears,
  parseSexFromText,
  SyncElephantRecord,
} from "./types";

export type ElephantSpecies = "asian" | "african" | "other";

export function parseSpeciesFromPage($: cheerio.CheerioAPI): ElephantSpecies {
  const speciesRow = text($, "Species") ?? "";
  const heading = $("h1").first().text();
  const combined = `${speciesRow} ${heading}`;
  if (/asian|elephas maximus/i.test(combined)) return "asian";
  if (/african|loxodonta/i.test(combined)) return "african";
  return "other";
}

function text($: cheerio.CheerioAPI, label: string): string | undefined {
  let found: string | undefined;
  $("tr").each((_, row) => {
    const cells = $(row).find("td");
    if (cells.length < 2) return;
    const key = $(cells[0]).text().replace(/\s+/g, " ").trim();
    if (key.toLowerCase().startsWith(label.toLowerCase())) {
      found = $(cells[1]).text().replace(/\s+/g, " ").trim();
    }
  });
  return found;
}

function parseIdentification($: cheerio.CheerioAPI) {
  let chipId: string | undefined;
  let localId: string | undefined;
  const regionalIds: Record<string, string> = {};

  $("tr").each((_, row) => {
    const cells = $(row).find("td");
    if (cells.length < 2) return;
    const key = $(cells[0]).text().replace(/\s+/g, " ").trim();
    const value = $(cells[1]).text().replace(/\s+/g, " ").trim();
    if (!key || !value) return;

    const keyLower = key.toLowerCase();
    if (keyLower.startsWith("chip id")) chipId = value;
    else if (keyLower.startsWith("local id")) localId = value;
    else if (/database nr|eep nr|studbook/i.test(key)) {
      regionalIds[key.replace(/:$/, "")] = value;
    }
  });

  return { chipId, localId, regionalIds: Object.keys(regionalIds).length ? regionalIds : undefined };
}

function parseSubspecies($: cheerio.CheerioAPI, html: string): ElephantSubspecies {
  const speciesText = (text($, "Species") ?? "") + " " + html;
  if (/sumatrensis|sumatran/i.test(speciesText)) return "sumatran";
  if (/borneensis|borneo/i.test(speciesText)) return "borneo";
  if (/maximus maximus|sri lankan/i.test(speciesText)) return "sri-lankan";
  if (/indicus|indian elephant/i.test(speciesText)) return "indian";
  return "unknown";
}

function parseOrigin($: cheerio.CheerioAPI): ElephantOrigin {
  const bornRow = $("tr")
    .filter((_, row) => $(row).text().toLowerCase().includes("born:"))
    .first()
    .text()
    .toLowerCase();
  const bio = $("p").text().toLowerCase();
  const combined = `${bornRow} ${bio}`;
  if (/captive-born|captive born/i.test(combined)) return "captive-born";
  if (/\bwild\b|wild-caught|captured/i.test(combined)) return "wild-caught";
  return "unknown";
}

function parseParents($: cheerio.CheerioAPI) {
  let fatherName: string | undefined;
  let motherName: string | undefined;
  let fatherId: string | undefined;
  let motherId: string | undefined;

  $("tr").each((_, row) => {
    const cells = $(row).find("td");
    if (cells.length < 2) return;
    const key = $(cells[0]).text().replace(/\s+/g, " ").trim();
    if (!key.toLowerCase().startsWith("parents")) return;

    const html = $(cells[1]).html() ?? "";
    const sire = html.match(/database2\.php\?elephant_id=(\d+)[^>]*>([^<]+)</i);
    const dam = html.match(/x[\s\S]*database2\.php\?elephant_id=(\d+)[^>]*>([^<]+)</i);
    if (sire) {
      fatherId = sire[1];
      fatherName = cheerio.load(sire[2]).text().trim();
    }
    if (dam) {
      motherId = dam[1];
      motherName = cheerio.load(dam[2]).text().trim();
    }
  });

  return { fatherName, motherName, fatherId, motherId };
}

function parseTransfers($: cheerio.CheerioAPI) {
  const transfers: SyncElephantRecord["transfers"] = [];
  let inArrival = false;

  $("tr").each((_, row) => {
    const rowText = $(row).text();
    if (rowText.includes("Date of arrival")) {
      inArrival = true;
      return;
    }
    if (!inArrival) return;
    if (rowText.includes("Record history")) {
      inArrival = false;
      return;
    }

    const cells = $(row).find("td");
    if (cells.length < 2) return;

    const date = cleanDate($(cells[0]).text().trim());
    const toCell = $(cells[1]);
    const toLocation = toCell.find("a[href*='location2.php']").first().text().trim();
    const toLocationId = toCell
      .find("a[href*='location_id=']")
      .attr("href")
      ?.match(/location_id=(\d+)/)?.[1];

    const fromMatch = toCell.html()?.match(/from\s*<a[^>]+location_id=(\d+)[^>]*>([^<]+)</i);
    const fromLocationId = fromMatch?.[1];
    const fromLocation = fromMatch?.[2] ? cheerio.load(fromMatch[2]).text().trim() : undefined;

    if (date || toLocation || fromLocation) {
      transfers.push({ date, toLocation, toLocationId, fromLocation, fromLocationId });
    } else if (toLocation && !date) {
      transfers.push({ toLocation, toLocationId });
    }
  });

  return transfers.length ? transfers : undefined;
}

function parsePhotos($: cheerio.CheerioAPI) {
  const photos: SyncElephantRecord["photos"] = [];
  $("table img[src]").each((_, img) => {
    const src = $(img).attr("src");
    if (!src || src.includes("logo") || src.includes("gif")) return;
    const credit =
      $(img).attr("alt")?.trim() ||
      $(img).parent("a").text().trim() ||
      $(img).closest("td").find("a").first().text().trim();
    photos.push({ url: src, credit: credit || undefined });
  });
  return photos.length ? photos.slice(0, 3) : undefined;
}

function parseSources($: cheerio.CheerioAPI) {
  const sources: string[] = [];
  let inSources = false;
  $("h2, h3, li, p").each((_, el) => {
    const tag = el.tagName?.toLowerCase();
    const t = $(el).text().trim();
    if (/^sources used for/i.test(t) || t === "References") {
      inSources = true;
      return;
    }
    if (inSources && tag === "h2" && !/reference/i.test(t)) {
      inSources = false;
      return;
    }
    if (inSources && tag === "li" && t.length > 5) {
      sources.push(t);
    }
  });
  return sources.length ? sources.slice(0, 10) : undefined;
}

function parseBirthDate($: cheerio.CheerioAPI): string | undefined {
  const bornCell = $("tr")
    .filter((_, row) => {
      const t = $(row).text().toLowerCase();
      return t.includes("born:") && !t.includes("death");
    })
    .first()
    .find("td")
    .eq(1)
    .text();

  const fromBorn = bornCell.match(/(\d{4}(?:-\d{2}(?:-\d{2})?)?|\~\d{4})/)?.[1];
  const fromBio =
    $("p").text().match(/born captive-born\s+(\d{4}-\d{2}-\d{2})/i)?.[1] ||
    $("p").text().match(/was born[^0-9]*(\d{4}-\d{2}-\d{2}|\d{4}|\~\d{4})/i)?.[1];

  return cleanDate(fromBorn || fromBio);
}

export function parseElephantPage(html: string, id: string): SyncElephantRecord | null {
  const $ = cheerio.load(html);
  const title = $("title").text();
  if (!title || title.includes("404")) return null;

  if (parseSpeciesFromPage($) !== "asian") return null;

  const heading = $("h1").first().text().replace(/\s+/g, " ").trim();
  const nameMatch = heading.match(/^(.+?)\s+Asian elephant/i);
  const name = nameMatch?.[1]?.trim() || heading.split("Asian elephant")[0]?.trim() || "unknown";

  const sexAge = text($, "Sex and age") ?? "";
  const sex = parseSexFromText(sexAge);
  const ageYears = parseAgeYears(sexAge);
  const management = text($, "Management");
  const birthPlace = text($, "Birth place");
  const deathReason = text($, "Death reason");

  const locationCell = $("tr")
    .filter((_, row) => $(row).text().includes("Present / last location"))
    .find("td")
    .eq(1);

  const locationName =
    locationCell.find("a[href*='location2.php']").first().text().trim() ||
    text($, "Present / last location")?.split(",")[0]?.trim() ||
    "Unknown";

  const locationHref = locationCell.find("a[href*='location_id=']").attr("href");
  const locationId = locationHref?.match(/location_id=(\d+)/)?.[1];

  const country =
    locationCell.find("a[href*='country.php']").text().trim() ||
    title.split(" in ").pop()?.replace(/ - Elephant.*/, "").trim() ||
    "Unknown";

  const birthDate = parseBirthDate($);

  const deathRow = $("tr").filter((_, row) => {
    const t = $(row).text().toLowerCase();
    return t.includes("death") || t.includes("died");
  });
  const deathDate = cleanDate(deathRow.text().match(/(\d{4}-\d{2}-\d{2}|\d{4})/)?.[1]);

  const status: SyncElephantRecord["status"] = deathDate ? "deceased" : "living";

  const transfers = parseTransfers($);
  const arrivalDate =
    transfers?.[0]?.date ||
    cleanDate(
      $("tr")
        .filter((_, row) => $(row).text().includes("Date of arrival"))
        .nextAll("tr")
        .first()
        .find("td")
        .first()
        .text()
        .trim()
    );

  const parents = parseParents($);
  const identification = parseIdentification($);
  const category = locationName.toLowerCase().includes("zoo")
    ? "zoo"
    : locationName.toLowerCase().includes("temple")
      ? "temple"
      : locationName.toLowerCase().includes("hospital")
        ? "hospital"
        : country === "Unknown"
          ? "other"
          : "camp";

  return {
    id,
    name,
    sex,
    status,
    species: "asian",
    subspecies: parseSubspecies($, html),
    birthDate,
    birthPlace,
    deathDate,
    deathReason,
    ageYears,
    origin: parseOrigin($),
    locationId,
    locationName,
    country,
    category,
    management,
    arrivalDate,
    transfers,
    photos: parsePhotos($),
    sources: parseSources($),
    ...parents,
    ...identification,
    sourceUrl: elephantPageUrl(id),
    syncedAt: new Date().toISOString(),
  };
}

export function parseRssDescription(description: string, id: string): Partial<SyncElephantRecord> {
  const born = description.match(/born:\s*~?(\d{4}[^(),]*|\d{4}-\d{2}-\d{2})/i)?.[1]?.trim();
  const dead = description.match(/dead:\s*([^,]+)/i)?.[1]?.trim();
  const arrived = description.match(/arrived:\s*(\d{4}[^:]*):/i)?.[1]?.trim();
  const location = description.match(/arrived:[^:]*:\s*([^(]+)\(/i)?.[1]?.trim();
  const categoryRaw = description.match(/\(([^)]+)\)\s*from/i)?.[1];
  const hasDeath = Boolean(dead && /\d{4}/.test(dead));

  return {
    id,
    birthDate: born && born.length > 2 ? cleanDate(born) : undefined,
    deathDate: hasDeath ? cleanDate(dead) : undefined,
    arrivalDate: arrived ? cleanDate(arrived) : undefined,
    locationName: location || undefined,
    category: categoryRaw ? normalizeCategory(categoryRaw) : undefined,
    status: hasDeath ? "deceased" : "living",
  };
}

export function extractElephantIdsFromHtml(html: string): string[] {
  const matches = html.matchAll(/database2\.php\?elephant_id=(\d+)/g);
  return [...new Set([...matches].map((m) => m[1]))];
}

export function extractSearchLocationIdsFromHtml(html: string): string[] {
  const $ = cheerio.load(html);
  const ids: string[] = [];
  $('a[href*="location2.php?location_id"]').each((_, el) => {
    const href = $(el).attr("href") ?? "";
    const id = href.match(/location_id=(\d+)/)?.[1];
    const text = $(el).text().trim();
    if (!id || !text || text.includes("location2.php")) return;
    ids.push(id);
  });
  return [...new Set(ids)];
}

export function extractLocationIdsFromHtml(html: string): string[] {
  const matches = html.matchAll(/location2\.php\?location_id=(\d+)/g);
  return [...new Set([...matches].map((m) => m[1]))];
}

export function parseLocationCountry(html: string): string | undefined {
  const $ = cheerio.load(html);
  const fromLink = $('a[href*="country.php?name="]').first().text().trim();
  if (fromLink) return fromLink;

  const raw = html.match(/country\.php\?name=([^&"']+)/)?.[1];
  if (!raw) return undefined;
  return decodeURIComponent(raw.replace(/&amp;/g, "&").split("&")[0]);
}
