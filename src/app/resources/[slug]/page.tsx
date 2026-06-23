import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { articles, categoryLabels } from "@/data/articles";
import { hotspots } from "@/data/hotspots";
import { getCountrySlugFromDbName } from "@/data/countryMeta";
import { JsonLd } from "@/components/seo/JsonLd";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  if (!article) return { title: "Article Not Found" };
  return {
    title: article.title,
    description: article.excerpt,
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);

  if (!article) notFound();

  const relatedHotspot = hotspots.find((h) => h.relatedArticleSlug === article.slug);
  const relatedCountrySlug = relatedHotspot
    ? getCountrySlugFromDbName(relatedHotspot.country)
    : undefined;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: article.image,
    datePublished: article.date,
    author: { "@type": "Person", name: article.author },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: absoluteUrl("/"),
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(`/resources/${article.slug}`),
    },
  };

  return (
    <>
      <JsonLd data={articleJsonLd} />
      <section className="relative h-[40vh] min-h-[300px]">
        <Image
          src={article.image}
          alt={article.title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest/80 to-transparent" />
      </section>

      <article className="py-12 md:py-16">
        <Container size="narrow">
          <Badge variant="info" className="mb-4">
            {categoryLabels[article.category]}
          </Badge>
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-forest leading-tight">
            {article.title}
          </h1>
          <p className="mt-4 text-muted">
            {article.author} &middot;{" "}
            {new Date(article.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}{" "}
            &middot; {article.readTime} min read
          </p>

          <div className="mt-10 space-y-6">
            {article.content.map((paragraph, i) => (
              <p key={i} className="text-lg text-muted leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {relatedHotspot && (
            <div className="mt-12 rounded-xl border border-clay/30 bg-clay-light/20 p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-clay mb-2">
                On the range map
              </p>
              <h2 className="font-serif text-xl font-bold text-forest mb-2">
                {relatedHotspot.name}
              </h2>
              <p className="text-sm text-muted leading-relaxed mb-4">
                This story maps to a coexistence hotspot in {relatedHotspot.country}.{" "}
                {relatedHotspot.impact}.
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <Link href="/coexistence" className="text-clay hover:text-forest font-medium">
                  See it on the range map →
                </Link>
                {relatedCountrySlug && (
                  <Link
                    href={`/countries/${relatedCountrySlug}`}
                    className="text-clay hover:text-forest font-medium"
                  >
                    {relatedHotspot.country} country hub →
                  </Link>
                )}
              </div>
            </div>
          )}

          <div className="mt-12 pt-8 border-t border-border flex flex-wrap gap-4">
            <Button href="/resources" variant="outline">
              All Resources
            </Button>
            <Button href="/donate" variant="secondary">
              Support This Work
            </Button>
          </div>
        </Container>
      </article>
    </>
  );
}
