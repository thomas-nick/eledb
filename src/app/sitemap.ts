import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { countryMetaList } from "@/data/countryMeta";
import { articles } from "@/data/articles";
import { listLocations } from "@/lib/locations";
import { searchElephants } from "@/lib/elephants";

// Camps and elephant records come from MySQL; resolve at request time.
export const dynamic = "force-dynamic";

// Keep the elephants section bounded; favor the freshest named records.
const MAX_ELEPHANTS = 2000;
const MAX_CAMPS = 200;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: Array<{
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }> = [
    { path: "", changeFrequency: "weekly", priority: 1 },
    { path: "/elephants", changeFrequency: "daily", priority: 0.9 },
    { path: "/countries", changeFrequency: "weekly", priority: 0.8 },
    { path: "/camps", changeFrequency: "weekly", priority: 0.8 },
    { path: "/sanctuaries", changeFrequency: "weekly", priority: 0.8 },
    { path: "/corridors", changeFrequency: "monthly", priority: 0.7 },
    { path: "/coexistence", changeFrequency: "monthly", priority: 0.7 },
    { path: "/resources", changeFrequency: "weekly", priority: 0.7 },
    { path: "/about", changeFrequency: "monthly", priority: 0.5 },
    { path: "/donate", changeFrequency: "monthly", priority: 0.5 },
  ];

  const staticRoutes: MetadataRoute.Sitemap = staticPages.map((page) => ({
    url: `${SITE_URL}${page.path}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  const countryRoutes: MetadataRoute.Sitemap = countryMetaList.map((c) => ({
    url: `${SITE_URL}/countries/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE_URL}/resources/${a.slug}`,
    lastModified: new Date(a.date),
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  let campRoutes: MetadataRoute.Sitemap = [];
  try {
    const { locations } = await listLocations({ limit: MAX_CAMPS });
    campRoutes = locations.map((loc) => ({
      url: `${SITE_URL}/camps/${loc.id}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    }));
  } catch {
    // DB unavailable — skip dynamic camp routes rather than failing the sitemap.
  }

  let elephantRoutes: MetadataRoute.Sitemap = [];
  try {
    const { elephants } = await searchElephants({
      namedOnly: true,
      sort: "updated",
      perPage: MAX_ELEPHANTS,
      page: 1,
    });
    elephantRoutes = elephants.map((e) => ({
      url: `${SITE_URL}/elephants/${e.id}`,
      lastModified: e.syncedAt ? new Date(e.syncedAt) : now,
      changeFrequency: "monthly",
      priority: 0.5,
    }));
  } catch {
    // DB unavailable — skip dynamic elephant routes.
  }

  return [
    ...staticRoutes,
    ...countryRoutes,
    ...articleRoutes,
    ...campRoutes,
    ...elephantRoutes,
  ];
}
