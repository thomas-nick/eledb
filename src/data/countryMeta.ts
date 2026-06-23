import { rangeStates } from "@/data/rangeStates";
import { mapPaths, MAP_VIEWBOX } from "@/data/mapGeometry";

export type CountryTheme = "forest" | "sage" | "amber" | "clay" | "ocean" | "sunset";
export type CountryRegion = "south-asia" | "southeast-asia";

export interface CountryMeta {
  /** URL slug — matches rangeStates.id */
  slug: string;
  /** Primary country value in elephant.se / MySQL */
  dbCountry: string;
  /** Display title in hero */
  title: string;
  flag: string;
  subspecies: string;
  tagline: string;
  overview: string;
  articleSlugs: string[];
  region: CountryRegion;
  theme: CountryTheme;
  /** Optional decorative photo — may be absent or 404 */
  heroImage?: string;
  /** SVG path from stylized regional map */
  mapPath: string;
}

const rangeById = Object.fromEntries(rangeStates.map((s) => [s.id, s]));

function meta(
  slug: string,
  dbCountry: string,
  opts: {
    title?: string;
    flag: string;
    subspecies: string;
    tagline: string;
    overview: string;
    articleSlugs?: string[];
    region: CountryRegion;
    theme: CountryTheme;
    heroImage?: string;
    mapKey?: keyof typeof mapPaths;
  }
): CountryMeta {
  const range = rangeById[slug];
  const mapKey = opts.mapKey ?? (slug.replace("-", "") as keyof typeof mapPaths);
  return {
    slug,
    dbCountry,
    title: opts.title ?? range?.name ?? dbCountry,
    flag: opts.flag,
    subspecies: opts.subspecies,
    tagline: opts.tagline,
    overview: opts.overview,
    articleSlugs: opts.articleSlugs ?? [],
    region: opts.region,
    theme: opts.theme,
    heroImage: opts.heroImage,
    mapPath: mapPaths[mapKey] ?? "",
  };
}

export const countryMetaList: CountryMeta[] = [
  meta("thailand", "Thailand", {
    flag: "🇹🇭",
    subspecies: "Indian elephant (E. m. indicus)",
    tagline: "4,000 years of chang — camps, culture, and conservation",
    overview:
      "Thailand holds the largest captive elephant population in Asia and one of the world's deepest mahout traditions. From royal white elephants in Lampang to community coexistence programs in Kui Buri, Thai elephants sit at the intersection of culture, tourism, and wild-range protection.",
    articleSlugs: ["mahouts-and-culture-thailand", "tourist-guide-ethical-elephants"],
    region: "southeast-asia",
    theme: "forest",
    heroImage: "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=1400&q=80",
    mapKey: "thailand",
  }),
  meta("india", "India", {
    flag: "🇮🇳",
    subspecies: "Indian elephant (E. m. indicus)",
    tagline: "~60% of Asia's wild elephants — and the continent's largest database",
    overview:
      "India is home to roughly 30,000 wild Asian elephants across fragmented forests from Assam to the Western Ghats. Human-elephant conflict is intense, but community-led solutions — beehive fences, early warning systems, corridor securing — are scaling across the range.",
    articleSlugs: ["beehive-fencing-assam"],
    region: "south-asia",
    theme: "amber",
    heroImage: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1400&q=80",
    mapKey: "india",
  }),
  meta("sri-lanka", "Sri Lanka", {
    flag: "🇱🇰",
    subspecies: "Sri Lankan elephant (E. m. maximus)",
    tagline: "An island herd sharing space with 22 million people",
    overview:
      "Sri Lanka's ~5,900 elephants are genetically distinct from mainland populations. High human-elephant conflict has driven innovative coexistence tools — from SMS early warning networks to community watch groups — that are now models for the rest of Asia.",
    articleSlugs: ["sms-warning-sri-lanka"],
    region: "south-asia",
    theme: "ocean",
    mapKey: "sriLanka",
  }),
  meta("indonesia", "Indonesia", {
    title: "Indonesia (Sumatra)",
    flag: "🇮🇩",
    subspecies: "Sumatran elephant (E. m. sumatranus)",
    tagline: "Critically isolated herds on the brink of genetic collapse",
    overview:
      "Sumatra's elephants survive in forest fragments surrounded by palm oil and settlements. Genetic studies show some herds are just two generations from inbreeding depression — making wildlife corridors not optional, but urgent.",
    articleSlugs: ["sumatra-genetic-crisis"],
    region: "southeast-asia",
    theme: "clay",
    heroImage: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1400&q=80",
    mapKey: "indonesia",
  }),
  meta("cambodia", "Cambodia", {
    flag: "🇰🇭",
    subspecies: "Indian elephant (E. m. indicus)",
    tagline: "Recovering forests and a growing camp sector",
    overview:
      "Cambodia's elephant population is small but ecologically significant, with wild herds in the Cardamom Mountains and a captive sector tied to temples and tourism. Conservation focus is on anti-poaching, corridor protection, and welfare standards at visitor facilities.",
    articleSlugs: ["tourist-guide-ethical-elephants"],
    region: "southeast-asia",
    theme: "sage",
    mapKey: "cambodia",
  }),
  meta("myanmar", "Myanmar", {
    flag: "🇲🇲",
    subspecies: "Indian elephant (E. m. indicus)",
    tagline: "Wild forests and logging-era captive herds",
    overview:
      "Myanmar retains significant wild elephant habitat along its borders with India and Thailand. Decades of logging left large captive populations; today, welfare transitions and cross-border corridor work are central to long-term survival.",
    articleSlugs: [],
    region: "southeast-asia",
    theme: "forest",
    mapKey: "myanmar",
  }),
  meta("nepal", "Nepal", {
    flag: "🇳🇵",
    subspecies: "Indian elephant (E. m. indicus)",
    tagline: "Terai grasslands and India-border corridors",
    overview:
      "Nepal's Terai lowlands hold a small but growing elephant population connected — when corridors work — to India's much larger herds. Community forestry and transboundary cooperation with India are the backbone of conservation here.",
    articleSlugs: [],
    region: "south-asia",
    theme: "sage",
    mapKey: "nepal",
  }),
  meta("laos", "Laos", {
    flag: "🇱🇦",
    subspecies: "Indian elephant (E. m. indicus)",
    tagline: "Mekong forests and a shrinking wild range",
    overview:
      "Laos once held one of the region's largest wild elephant populations. Habitat loss and poaching have reduced numbers sharply, while a small camp sector remains tied to rural livelihoods and Buddhist tradition.",
    articleSlugs: [],
    region: "southeast-asia",
    theme: "sunset",
    mapKey: "laos",
  }),
  meta("vietnam", "Vietnam", {
    flag: "🇻🇳",
    subspecies: "Indian elephant (E. m. indicus)",
    tagline: "One of the smallest and most threatened range states",
    overview:
      "Vietnam's wild elephant population may number fewer than 100 animals in isolated pockets. Captive elephants at temples and tourism facilities represent a legacy population; rewilding and genetic rescue are active research areas.",
    articleSlugs: [],
    region: "southeast-asia",
    theme: "clay",
    mapKey: "vietnam",
  }),
  meta("malaysia", "Malaysia", {
    flag: "🇲🇾",
    subspecies: "Indian elephant (E. m. indicus)",
    tagline: "Peninsular forests and cross-border migration",
    overview:
      "Peninsular Malaysia's elephants migrate seasonally across a landscape of plantations and protected forest. Securing migration routes into southern Thailand and Sumatra is critical for maintaining genetic diversity across the region.",
    articleSlugs: [],
    region: "southeast-asia",
    theme: "ocean",
    mapKey: "malaysia",
  }),
  meta("bangladesh", "Bangladesh", {
    flag: "🇧🇩",
    subspecies: "Indian elephant (E. m. indicus)",
    tagline: "Chittagong Hill Tracts and India-border herds",
    overview:
      "Bangladesh's elephants are confined to forest patches in the southeast, often crossing into India. Human-elephant conflict in tea and crop lands drives much of the conservation response, with community compensation schemes and habitat restoration.",
    articleSlugs: [],
    region: "south-asia",
    theme: "sunset",
    mapKey: "bangladesh",
  }),
  meta("bhutan", "Bhutan", {
    flag: "🇧🇹",
    subspecies: "Indian elephant (E. m. indicus)",
    tagline: "Lowland refuges below the Himalayas",
    overview:
      "Bhutan's southern foothills shelter a small but increasing elephant population. The country's forest conservation ethos provides relative protection, though agricultural encroachment at range edges remains a pressure point.",
    articleSlugs: [],
    region: "south-asia",
    theme: "forest",
    mapKey: "bhutan",
  }),
  meta("china", "China", {
    title: "China (Yunnan)",
    flag: "🇨🇳",
    subspecies: "Indian elephant (E. m. indicus)",
    tagline: "Yunnan's last wild herds along the Myanmar border",
    overview:
      "China's Asian elephants survive only in Yunnan Province, near the Myanmar border. A growing population in recent years reflects strong protection — but habitat fragmentation around Xishuangbanna remains the primary long-term threat.",
    articleSlugs: [],
    region: "southeast-asia",
    theme: "amber",
    mapKey: "china",
  }),
];

export const countryMetaBySlug = Object.fromEntries(
  countryMetaList.map((c) => [c.slug, c])
) as Record<string, CountryMeta>;

const dbCountryToSlug = new Map<string, string>();
for (const c of countryMetaList) {
  dbCountryToSlug.set(c.dbCountry, c.slug);
}

export function getCountryMeta(slug: string): CountryMeta | undefined {
  return countryMetaBySlug[slug];
}

export function getCountrySlugFromDbName(dbCountry: string): string | undefined {
  return dbCountryToSlug.get(dbCountry);
}

export function getCountryMetaByDbName(dbCountry: string): CountryMeta | undefined {
  const slug = getCountrySlugFromDbName(dbCountry);
  return slug ? countryMetaBySlug[slug] : undefined;
}

export function getAllCountrySlugs(): string[] {
  return countryMetaList.map((c) => c.slug);
}

export const COUNTRY_MAP_VIEWBOX = MAP_VIEWBOX;

export interface CountryThemeStyle {
  /** Gradient stops (left-to-right) */
  gradient: string;
  /** Foreground accent (used for shape stroke + eyebrow) */
  accent: string;
  /** Hover/active accent */
  accentLight: string;
  /** Subtle background tint for section headers */
  tint: string;
  /** Border color when used on light surfaces */
  border: string;
}

export const countryThemes: Record<CountryTheme, CountryThemeStyle> = {
  forest: {
    gradient: "linear-gradient(135deg, #0f2418 0%, #1a3a2a 45%, #2d5a42 100%)",
    accent: "#a3d3a6",
    accentLight: "#cbe8cd",
    tint: "rgba(26, 58, 42, 0.06)",
    border: "rgba(26, 58, 42, 0.18)",
  },
  sage: {
    gradient: "linear-gradient(135deg, #1f3a2e 0%, #355a48 50%, #5d8870 100%)",
    accent: "#bcd9c7",
    accentLight: "#dceee3",
    tint: "rgba(53, 90, 72, 0.06)",
    border: "rgba(53, 90, 72, 0.18)",
  },
  amber: {
    gradient: "linear-gradient(135deg, #3d2410 0%, #6b3e1f 50%, #9c5e2d 100%)",
    accent: "#f3b97a",
    accentLight: "#f9d5a8",
    tint: "rgba(155, 94, 45, 0.07)",
    border: "rgba(155, 94, 45, 0.22)",
  },
  clay: {
    gradient: "linear-gradient(135deg, #3a1f12 0%, #6e3a22 50%, #a85d42 100%)",
    accent: "#f0b294",
    accentLight: "#f8cfb8",
    tint: "rgba(168, 93, 66, 0.07)",
    border: "rgba(168, 93, 66, 0.22)",
  },
  ocean: {
    gradient: "linear-gradient(135deg, #0e2840 0%, #1c4670 50%, #2f6da3 100%)",
    accent: "#9ec8ec",
    accentLight: "#c5dff3",
    tint: "rgba(47, 109, 163, 0.07)",
    border: "rgba(47, 109, 163, 0.22)",
  },
  sunset: {
    gradient: "linear-gradient(135deg, #3a1a2a 0%, #6a2e3e 45%, #b86b5d 100%)",
    accent: "#f5b8a8",
    accentLight: "#fad3c6",
    tint: "rgba(184, 107, 93, 0.07)",
    border: "rgba(184, 107, 93, 0.22)",
  },
};

export function getCountryTheme(meta: CountryMeta): CountryThemeStyle {
  return countryThemes[meta.theme];
}
