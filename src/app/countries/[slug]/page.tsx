import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { CountryHero } from "@/components/countries/CountryHero";
import { CountryStatsStrip } from "@/components/countries/CountryStatsStrip";
import { SectionHeader } from "@/components/countries/SectionHeader";
import {
  ArticleMiniCard,
  CorridorCardMini,
  HotspotCard,
  SanctuaryMiniCard,
} from "@/components/countries/CountrySectionCards";
import { ElephantCard } from "@/components/elephants/ElephantCard";
import { CampCard } from "@/components/camps/CampCard";
import { ElephantAttribution } from "@/components/elephants/ElephantAttribution";
import { getCountryPageData } from "@/lib/countries";
import { getCountryTheme } from "@/data/countryMeta";

interface CountryPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: CountryPageProps) {
  const { slug } = await params;
  const data = await getCountryPageData(slug);
  if (!data) return { title: "Country not found" };
  return {
    title: data.meta.title,
    description: data.meta.overview,
    openGraph: {
      title: `${data.meta.title} | mahoot`,
      description: data.meta.tagline,
      ...(data.meta.heroImage && { images: [{ url: data.meta.heroImage }] }),
    },
  };
}

export default async function CountryPage({ params }: CountryPageProps) {
  const { slug } = await params;
  const data = await getCountryPageData(slug);
  if (!data) notFound();

  const { meta, range, stats, featuredElephants, camps, hotspots, corridors, sanctuaries, articles } =
    data;
  const theme = getCountryTheme(meta);
  const themeProps = { tint: theme.tint, border: theme.border, accent: theme.accent };

  const hasAnySection =
    featuredElephants.length +
      camps.length +
      sanctuaries.length +
      hotspots.length +
      corridors.length +
      articles.length >
    0;

  return (
    <div className="bg-slate-50 min-h-screen">
      <CountryHero meta={meta} range={range} />
      <CountryStatsStrip
        meta={meta}
        stats={stats}
        range={range}
        sanctuaryCount={sanctuaries.length}
        hotspotCount={hotspots.length}
      />

      <section className="py-10 md:py-14">
        <Container size="wide">
          {featuredElephants.length > 0 && (
            <div className="mb-12">
              <SectionHeader
                {...themeProps}
                icon="records"
                eyebrow="Database"
                title="Featured records"
                description={`Recently updated named elephants in ${meta.title}.`}
                action={{
                  label: `View all ${stats.total.toLocaleString()}`,
                  href: `/elephants?country=${encodeURIComponent(meta.dbCountry)}`,
                }}
              />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {featuredElephants.map((elephant) => (
                  <ElephantCard key={elephant.id} elephant={elephant} />
                ))}
              </div>
            </div>
          )}

          {camps.length > 0 && (
            <div className="mb-12">
              <SectionHeader
                {...themeProps}
                icon="camps"
                eyebrow="Facilities"
                title="Camps & facilities"
                description="Top elephant.se locations by record count — many linked to our curated sanctuary directory."
                action={{
                  label: "All camps",
                  href: `/camps?country=${encodeURIComponent(meta.dbCountry)}`,
                }}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {camps.map((loc) => (
                  <CampCard key={loc.id} location={loc} />
                ))}
              </div>
            </div>
          )}

          {sanctuaries.length > 0 && (
            <div className="mb-12">
              <SectionHeader
                {...themeProps}
                icon="sanctuary"
                eyebrow="Curated"
                title="Sanctuary directory"
                description="Hand-verified listings tagged by experience type and welfare criteria."
                action={{ label: "Browse all", href: "/sanctuaries" }}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sanctuaries.map((s) => (
                  <SanctuaryMiniCard key={s.id} sanctuary={s} />
                ))}
              </div>
            </div>
          )}

          {hotspots.length > 0 && (
            <div className="mb-12">
              <SectionHeader
                {...themeProps}
                icon="hotspot"
                eyebrow="On the ground"
                title="Coexistence in action"
                description="Field programs reducing human-elephant conflict, mapped on our range map."
                action={{ label: "Range map", href: "/coexistence" }}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hotspots.map((h) => (
                  <HotspotCard key={h.id} hotspot={h} accent={theme.accent} />
                ))}
              </div>
            </div>
          )}

          {corridors.length > 0 && (
            <div className="mb-12">
              <SectionHeader
                {...themeProps}
                icon="corridor"
                eyebrow="Connectivity"
                title="Migration corridors"
                description="Where habitat must be linked to maintain genetic flow and wild range."
                action={{ label: "All corridors", href: "/corridors" }}
              />
              <div className="space-y-4">
                {corridors.map((c) => (
                  <CorridorCardMini key={c.id} corridor={c} />
                ))}
              </div>
            </div>
          )}

          {articles.length > 0 && (
            <div className="mb-12">
              <SectionHeader
                {...themeProps}
                icon="article"
                eyebrow="Resources"
                title="Field notes & stories"
                description={`Editorial coverage relevant to ${meta.title}.`}
                action={{ label: "All resources", href: "/resources" }}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {articles.map((article) => (
                  <ArticleMiniCard key={article.slug} article={article} />
                ))}
              </div>
            </div>
          )}

          {!hasAnySection && (
            <div className="text-center py-16 rounded-xl border border-dashed border-slate-300 bg-white">
              <p className="text-sm text-slate-500 mb-4">
                No detailed records yet for {meta.title}.
              </p>
              <Link
                href={`/elephants?country=${encodeURIComponent(meta.title)}`}
                className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-forest text-white hover:bg-forest-light transition-colors"
              >
                Browse elephants in {meta.title}
              </Link>
            </div>
          )}

          <div className="mt-12">
            <ElephantAttribution />
          </div>
        </Container>
      </section>
    </div>
  );
}
